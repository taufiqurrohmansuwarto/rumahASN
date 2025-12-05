const OpenAI = require("openai");
const { handleError } = require("@/utils/helper/controller-helper");
const KanbanProject = require("@/models/kanban/projects.model");
const KanbanTask = require("@/models/kanban/tasks.model");
const KanbanColumn = require("@/models/kanban/columns.model");
const KanbanSubtask = require("@/models/kanban/subtasks.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Task Assist - Generate subtasks & suggest priority/estimasi
 */
const taskAssist = async (req, res) => {
  try {
    const { title, description } = req?.body;

    if (!title) {
      return res.status(400).json({ message: "Judul task wajib diisi" });
    }

    const prompt = `Kamu adalah asisten project manager di instansi pemerintah Indonesia. 
Berdasarkan judul task dan deskripsi berikut, berikan:
1. Daftar subtask (langkah-langkah yang harus dilakukan), maksimal 7 subtask
2. Saran prioritas (low/medium/high/urgent)
3. Estimasi waktu pengerjaan dalam jam

Judul Task: ${title}
${description ? `Deskripsi: ${description}` : ""}

Jawab dalam format JSON berikut (tanpa markdown code block):
{
  "subtasks": ["subtask 1", "subtask 2", ...],
  "priority": "medium",
  "estimated_hours": 4,
  "reasoning": "Penjelasan singkat mengapa saran ini diberikan"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI yang membantu project manager membuat task yang terstruktur. Selalu jawab dalam Bahasa Indonesia dan format JSON yang valid.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Parse JSON dari response
    let result;
    try {
      // Hapus markdown code block jika ada
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({
        message: "Gagal memproses respons AI",
        raw: responseText,
      });
    }

    res.json({
      success: true,
      data: {
        subtasks: result.subtasks || [],
        priority: result.priority || "medium",
        estimated_hours: result.estimated_hours || null,
        reasoning: result.reasoning || "",
      },
    });
  } catch (error) {
    console.error("AI Task Assist Error:", error);
    handleError(res, error);
  }
};

/**
 * AI Project Summary - Generate ringkasan project
 */
const projectSummary = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    // Check access
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Get project data
    const project = await KanbanProject.query()
      .findById(projectId)
      .withGraphFetched("[owner(simpleWithImage)]");

    if (!project) {
      return res.status(404).json({ message: "Project tidak ditemukan" });
    }

    // Get columns with task counts
    const columns = await KanbanColumn.query()
      .where("project_id", projectId)
      .orderBy("position", "asc");

    // Get all tasks
    const tasks = await KanbanTask.query()
      .where("project_id", projectId)
      .withGraphFetched("[assignees(simpleWithImage), column]");

    // Get members
    const members = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .withGraphFetched("user(simpleWithImage)");

    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed_at).length;
    const overdueTasks = tasks.filter(
      (t) => !t.completed_at && t.due_date && new Date(t.due_date) < new Date()
    );
    const urgentTasks = tasks.filter(
      (t) => !t.completed_at && t.priority === "urgent"
    );
    const highPriorityTasks = tasks.filter(
      (t) => !t.completed_at && t.priority === "high"
    );

    // Tasks by column
    const tasksByColumn = columns.map((col) => ({
      name: col.name,
      count: tasks.filter((t) => t.column_id === col.id).length,
      is_done: col.is_done_column,
    }));

    // Tasks by assignee
    const tasksByAssignee = {};
    tasks.forEach((task) => {
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach((assignee) => {
          if (!tasksByAssignee[assignee.username]) {
            tasksByAssignee[assignee.username] = {
              total: 0,
              completed: 0,
              overdue: 0,
            };
          }
          tasksByAssignee[assignee.username].total++;
          if (task.completed_at) {
            tasksByAssignee[assignee.username].completed++;
          }
          if (
            !task.completed_at &&
            task.due_date &&
            new Date(task.due_date) < new Date()
          ) {
            tasksByAssignee[assignee.username].overdue++;
          }
        });
      }
    });

    // Build context for AI
    const context = `
Data Project Kanban:
- Nama Project: ${project.name}
- Deskripsi: ${project.description || "Tidak ada"}
- Owner: ${project.owner?.username || "Unknown"}
- Jumlah Anggota: ${members.length}

Statistik Task:
- Total Task: ${totalTasks}
- Selesai: ${completedTasks} (${
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }%)
- Overdue: ${overdueTasks.length}
- Urgent: ${urgentTasks.length}
- High Priority: ${highPriorityTasks.length}

Task per Kolom:
${tasksByColumn.map((c) => `- ${c.name}: ${c.count} task`).join("\n")}

Task per Anggota:
${Object.entries(tasksByAssignee)
  .map(
    ([name, stats]) =>
      `- ${name}: ${stats.total} total, ${stats.completed} selesai, ${stats.overdue} overdue`
  )
  .join("\n")}

Task Overdue:
${
  overdueTasks.length > 0
    ? overdueTasks
        .slice(0, 5)
        .map((t) => `- "${t.title}" (deadline: ${t.due_date})`)
        .join("\n")
    : "Tidak ada"
}

Task Urgent:
${
  urgentTasks.length > 0
    ? urgentTasks
        .slice(0, 5)
        .map((t) => `- "${t.title}"`)
        .join("\n")
    : "Tidak ada"
}
`;

    const prompt = `Berdasarkan data project Kanban berikut, buatkan ringkasan eksekutif dalam Bahasa Indonesia yang informatif untuk pimpinan/atasan di instansi pemerintah.

${context}

Buatkan ringkasan yang mencakup:
1. Status keseluruhan project (1-2 kalimat)
2. Progress dan pencapaian
3. Hal-hal yang perlu perhatian (overdue, bottleneck)
4. Rekomendasi tindakan (jika ada)

Format jawaban dalam JSON (tanpa markdown code block):
{
  "status": "Baik/Perlu Perhatian/Kritis",
  "summary": "Ringkasan 2-3 paragraf",
  "highlights": ["poin penting 1", "poin penting 2"],
  "concerns": ["hal yang perlu perhatian 1", "hal yang perlu perhatian 2"],
  "recommendations": ["rekomendasi 1", "rekomendasi 2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI yang membantu memberikan ringkasan project untuk pimpinan instansi pemerintah. Gunakan bahasa formal namun mudah dipahami.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Parse JSON dari response
    let result;
    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({
        message: "Gagal memproses respons AI",
        raw: responseText,
      });
    }

    res.json({
      success: true,
      data: {
        project_name: project.name,
        generated_at: new Date().toISOString(),
        stats: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_rate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
          overdue_count: overdueTasks.length,
          urgent_count: urgentTasks.length,
        },
        ai_summary: result,
      },
    });
  } catch (error) {
    console.error("AI Project Summary Error:", error);
    handleError(res, error);
  }
};

/**
 * AI Auto Generate Subtasks dan insert ke database
 */
const generateAndSaveSubtasks = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;

    // Get task
    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(
      task.project_id,
      userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Check if task already has subtasks
    const existingSubtasks = await KanbanSubtask.query()
      .where("task_id", taskId)
      .count("id as count")
      .first();

    if (existingSubtasks.count > 0) {
      return res.status(400).json({
        message:
          "Task sudah memiliki subtask. Hapus subtask yang ada terlebih dahulu.",
      });
    }

    // Generate subtasks using AI
    const prompt = `Kamu adalah asisten project manager. Berdasarkan task berikut, buat daftar subtask (langkah-langkah) yang harus dilakukan. Maksimal 7 subtask.

Judul Task: ${task.title}
${task.description ? `Deskripsi: ${task.description}` : ""}

Jawab dengan array JSON berisi string subtask saja (tanpa markdown):
["subtask 1", "subtask 2", ...]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI. Jawab hanya dengan JSON array yang valid, tanpa markdown atau penjelasan tambahan.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let subtaskTitles;
    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      subtaskTitles = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ message: "Gagal memproses respons AI" });
    }

    if (!Array.isArray(subtaskTitles) || subtaskTitles.length === 0) {
      return res.status(500).json({ message: "AI tidak menghasilkan subtask" });
    }

    // Insert subtasks
    const insertedSubtasks = [];
    for (let i = 0; i < subtaskTitles.length; i++) {
      const subtask = await KanbanSubtask.query().insert({
        task_id: taskId,
        title: subtaskTitles[i],
        position: i + 1,
      });
      insertedSubtasks.push(subtask);
    }

    res.json({
      success: true,
      message: `${insertedSubtasks.length} subtask berhasil dibuat`,
      data: insertedSubtasks,
    });
  } catch (error) {
    console.error("AI Generate Subtasks Error:", error);
    handleError(res, error);
  }
};

/**
 * AI Task Summary - Ringkas progress task dalam 1 kalimat
 */
const taskSummary = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;

    // Get task with all related data
    const task = await KanbanTask.query()
      .findById(taskId)
      .withGraphFetched(
        "[subtasks, comments.[user], attachments, time_entries.[user], column]"
      );

    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(
      task.project_id,
      userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Build context
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter((s) => s.is_completed);
    const comments = task.comments || [];
    const attachments = task.attachments || [];
    const timeEntries = task.time_entries || [];
    const totalHours = timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);

    const context = `
Task: "${task.title}"
Status: ${task.column?.name || "Unknown"}
${task.description ? `Deskripsi: ${task.description}` : ""}

Subtask: ${completedSubtasks.length}/${subtasks.length} selesai
${subtasks
  .map((s) => `- [${s.is_completed ? "x" : " "}] ${s.title}`)
  .join("\n")}

Komentar terbaru (${comments.length} total):
${
  comments.length > 0
    ? comments
        .slice(0, 3)
        .map((c) => `- ${c.user?.username}: "${c.content}"`)
        .join("\n")
    : "Tidak ada"
}

Lampiran: ${attachments.length} file
${
  attachments.length > 0
    ? attachments
        .slice(0, 3)
        .map((a) => `- ${a.filename}`)
        .join("\n")
    : "Tidak ada"
}

Waktu tercatat: ${totalHours} jam dari ${task.estimated_hours || 0} jam estimasi
${
  timeEntries.length > 0
    ? timeEntries
        .slice(0, 3)
        .map(
          (t) =>
            `- ${t.user?.username}: ${t.hours} jam - ${t.description || ""}`
        )
        .join("\n")
    : "Tidak ada catatan waktu"
}
`;

    const prompt = `Berdasarkan data task berikut, buatkan ringkasan singkat (1-2 kalimat) dalam Bahasa Indonesia tentang progress task ini. Fokus pada apa yang sudah dikerjakan dan statusnya saat ini.

${context}

Jawab dalam format JSON (tanpa markdown):
{
  "summary": "Ringkasan 1-2 kalimat tentang progress task"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI yang meringkas progress task secara singkat dan informatif. Gunakan bahasa yang natural dan to the point.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let result;
    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ message: "Gagal memproses respons AI" });
    }

    res.json({
      success: true,
      data: {
        summary: result.summary,
        generated_at: new Date().toISOString(),
        stats: {
          subtasks_completed: completedSubtasks.length,
          subtasks_total: subtasks.length,
          comments_count: comments.length,
          attachments_count: attachments.length,
          time_logged: totalHours,
        },
      },
    });
  } catch (error) {
    console.error("AI Task Summary Error:", error);
    handleError(res, error);
  }
};

/**
 * AI Laporan Kegiatan - Generate laporan kegiatan tugas jabatan
 */
const laporanKegiatan = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId, startDate, endDate } = req?.query;

    // Check permission
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Get tasks with activities in date range
    const tasks = await KanbanTask.query()
      .where("project_id", projectId)
      .withGraphFetched("[subtasks, time_entries, activities]")
      .modifyGraph("activities", (builder) => {
        builder.whereBetween("created_at", [
          `${startDate} 00:00:00`,
          `${endDate} 23:59:59`,
        ]);
      })
      .modifyGraph("time_entries", (builder) => {
        builder
          .where("user_id", userId)
          .whereBetween("logged_date", [startDate, endDate]);
      });

    // Get time entries for this user in date range
    const KanbanTimeEntry = require("@/models/kanban/time-entries.model");
    const timeEntries = await KanbanTimeEntry.query()
      .join("kanban.tasks", "kanban.time_entries.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .where("kanban.time_entries.user_id", userId)
      .whereBetween("kanban.time_entries.logged_date", [startDate, endDate])
      .select("kanban.time_entries.*", "kanban.tasks.title as task_title")
      .orderBy("kanban.time_entries.logged_date", "asc");

    // Get activities (completed tasks, moved tasks)
    const activities = await KanbanTaskActivity.query()
      .join("kanban.tasks", "kanban.task_activities.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .where("kanban.task_activities.user_id", userId)
      .whereBetween("kanban.task_activities.created_at", [
        `${startDate} 00:00:00`,
        `${endDate} 23:59:59`,
      ])
      .whereIn("kanban.task_activities.action", [
        "completed",
        "created",
        "moved",
      ])
      .select("kanban.task_activities.*", "kanban.tasks.title as task_title")
      .orderBy("kanban.task_activities.created_at", "asc");

    // Build context for AI
    const dataForAI = [];

    // Add time entries
    timeEntries.forEach((entry) => {
      dataForAI.push({
        tanggal: entry.logged_date,
        kegiatan: `${entry.task_title}${
          entry.description ? ` - ${entry.description}` : ""
        }`,
        jam: entry.hours,
        type: "time_entry",
      });
    });

    // Add activities without time entries
    activities.forEach((act) => {
      const actCreatedAt =
        act.created_at instanceof Date
          ? act.created_at.toISOString()
          : String(act.created_at);
      const actTanggal = actCreatedAt.split("T")[0];

      const hasTimeEntry = timeEntries.some(
        (te) => te.task_id === act.task_id && te.logged_date === actTanggal
      );
      if (!hasTimeEntry) {
        dataForAI.push({
          tanggal: actTanggal,
          kegiatan: act.task_title,
          jam: 0,
          type: "activity",
          action: act.action,
        });
      }
    });

    // Sort by date
    dataForAI.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    if (dataForAI.length === 0) {
      return res.json({
        success: true,
        data: {
          kegiatan: [],
          ringkasan: "Tidak ada kegiatan dalam periode ini.",
          total_jam: 0,
        },
      });
    }

    // Build context
    const context = `
Data kegiatan dari ${startDate} sampai ${endDate}:
${dataForAI
  .map((d, i) => `${i + 1}. ${d.tanggal} - ${d.kegiatan} (${d.jam} jam)`)
  .join("\n")}
`;

    const prompt = `Kamu adalah asisten yang membantu ASN membuat laporan kegiatan tugas jabatan. Berdasarkan data kegiatan berikut, buatkan laporan kegiatan yang rapi dan formal untuk keperluan administratif.

${context}

Aturan:
1. Gabungkan kegiatan yang sama di tanggal yang sama
2. Tulis kegiatan dengan bahasa formal dan jelas
3. Jika jam = 0, estimasikan berdasarkan jenis kegiatan (minimal 1 jam)
4. Buat ringkasan singkat 1-2 kalimat tentang kegiatan selama periode ini

Format JSON (tanpa markdown):
{
  "kegiatan": [
    { "no": 1, "tanggal": "01-12-2025", "kegiatan": "Deskripsi kegiatan formal", "jam": 2 },
    ...
  ],
  "ringkasan": "Ringkasan kegiatan selama periode ini...",
  "total_jam": 10
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI yang membantu ASN membuat laporan kegiatan tugas jabatan. Gunakan bahasa formal dan profesional.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let result;
    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ message: "Gagal memproses respons AI" });
    }

    res.json({
      success: true,
      data: {
        kegiatan: result.kegiatan || [],
        ringkasan: result.ringkasan || "",
        total_jam: result.total_jam || 0,
        periode: { startDate, endDate },
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI Laporan Kegiatan Error:", error);
    handleError(res, error);
  }
};

/**
 * AI Task Laporan - Generate laporan kegiatan per task
 * Format: Tanggal | Uraian Kegiatan (dari subtask, time_entries, activities)
 */
const taskLaporan = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;

    // Get task with all related data
    const task = await KanbanTask.query()
      .findById(taskId)
      .withGraphFetched(
        "[subtasks, time_entries.[user], activities.[user], column]"
      );

    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(
      task.project_id,
      userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Collect data points
    const dataPoints = [];

    // From time_entries (most reliable - has date and description)
    if (task.time_entries?.length > 0) {
      task.time_entries.forEach((entry) => {
        dataPoints.push({
          tanggal: entry.logged_date,
          kegiatan: entry.description || `Mengerjakan ${task.title}`,
          jam: entry.hours,
          source: "time_entry",
        });
      });
    }

    // From completed subtasks (using completed_at date)
    if (task.subtasks?.length > 0) {
      task.subtasks.forEach((subtask) => {
        if (subtask.is_completed && subtask.completed_at) {
          const completedAt =
            subtask.completed_at instanceof Date
              ? subtask.completed_at.toISOString()
              : String(subtask.completed_at);
          const tanggal = completedAt.split("T")[0];

          dataPoints.push({
            tanggal,
            kegiatan: `Menyelesaikan: ${subtask.title}`,
            source: "subtask",
          });
        }
      });
    }

    // From activities (task moves, task completed, task created)
    if (task.activities?.length > 0) {
      task.activities.forEach((act) => {
        // Handle both Date object and string
        const createdAt =
          act.created_at instanceof Date
            ? act.created_at.toISOString()
            : String(act.created_at);
        const tanggal = createdAt.split("T")[0];
        let kegiatan = "";

        // Skip subtask_completed since we already get it from subtasks with completed_at
        if (act.action === "completed") {
          kegiatan = `Menyelesaikan task: ${task.title}`;
        } else if (act.action === "created") {
          kegiatan = `Membuat task: ${task.title}`;
        } else if (act.action === "moved") {
          const oldVal =
            typeof act.old_value === "string"
              ? JSON.parse(act.old_value || "{}")
              : act.old_value || {};
          const newVal =
            typeof act.new_value === "string"
              ? JSON.parse(act.new_value || "{}")
              : act.new_value || {};
          kegiatan = `Memindahkan task dari "${oldVal.column || "kolom"}" ke "${newVal.column || "kolom"}"`;
        }

        if (kegiatan) {
          dataPoints.push({
            tanggal,
            kegiatan,
            source: "activity",
          });
        }
      });
    }

    // Fallback: If subtasks exist but none completed, list them as planned work
    if (task.subtasks?.length > 0 && dataPoints.length === 0) {
      const taskCreatedAt =
        task.created_at instanceof Date
          ? task.created_at.toISOString()
          : String(task.created_at || new Date().toISOString());
      const startDate = taskCreatedAt.split("T")[0];

      task.subtasks.forEach((subtask) => {
        dataPoints.push({
          tanggal: startDate,
          kegiatan: `Merencanakan: ${subtask.title}`,
          source: "subtask_planned",
        });
      });
    }

    // If still no data, create basic entry
    if (dataPoints.length === 0) {
      return res.json({
        success: true,
        data: {
          kegiatan: [],
          message: "Tidak ada data kegiatan untuk task ini",
          generated_at: new Date().toISOString(),
        },
      });
    }

    // Sort by date
    dataPoints.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    // Build context for AI
    const context = `
Task: "${task.title}"
${task.description ? `Deskripsi: ${task.description}` : ""}

Data kegiatan yang tercatat:
${dataPoints
  .map(
    (d, i) =>
      `${i + 1}. ${d.tanggal} - ${d.kegiatan}${d.jam ? ` (${d.jam} jam)` : ""}`
  )
  .join("\n")}

Subtask yang ada:
${
  task.subtasks?.length > 0
    ? task.subtasks
        .map((s) => `- [${s.is_completed ? "x" : " "}] ${s.title}`)
        .join("\n")
    : "Tidak ada"
}
`;

    const prompt = `Kamu adalah asisten yang membantu ASN membuat laporan kegiatan tugas jabatan. Berdasarkan data task berikut, buatkan laporan kegiatan yang rapi untuk di-copy ke aplikasi kinerja.

${context}

Aturan:
1. Buat entri per hari kerja (pisahkan jika ada beberapa hari)
2. Gunakan bahasa formal dan profesional
3. Uraian kegiatan harus spesifik dan jelas
4. Jika subtask belum ada tanggal, distribusikan ke beberapa hari secara logis
5. Format tanggal: DD-MM-YYYY

Format JSON (tanpa markdown):
{
  "kegiatan": [
    { "tanggal": "01-12-2025", "kegiatan": "Uraian kegiatan hari 1" },
    { "tanggal": "02-12-2025", "kegiatan": "Uraian kegiatan hari 2" }
  ],
  "periode": {
    "start": "01-12-2025",
    "end": "03-12-2025"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI yang membantu ASN membuat laporan kegiatan. Gunakan bahasa formal dan profesional.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    let result;
    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ message: "Gagal memproses respons AI" });
    }

    res.json({
      success: true,
      data: {
        task_title: task.title,
        kegiatan: result.kegiatan || [],
        periode: result.periode,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI Task Laporan Error:", error);
    handleError(res, error);
  }
};

module.exports = {
  taskAssist,
  projectSummary,
  generateAndSaveSubtasks,
  taskSummary,
  laporanKegiatan,
  taskLaporan,
};
