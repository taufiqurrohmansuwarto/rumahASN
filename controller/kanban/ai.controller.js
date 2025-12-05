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

module.exports = {
  taskAssist,
  projectSummary,
  generateAndSaveSubtasks,
};
