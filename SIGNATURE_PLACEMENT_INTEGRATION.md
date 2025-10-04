# Signature Placement Integration Guide

## Overview
Sistem drag-and-drop signature placement untuk menggantikan sistem tag-based positioning.

## Components Created

### 1. DraggableSignature
Component untuk signature yang bisa di-drag.

**Location:** `src/components/EsignBKD/DraggableSignature.js`

### 2. Enhanced PdfViewer
PdfViewer dengan signature overlay support.

**Location:** `src/components/EsignBKD/PdfViewer.js`

### 3. SignaturePlacementForm
Form wrapper untuk signature placement.

**Location:** `src/components/EsignBKD/SignaturePlacementForm.js`

### 4. Helper Functions
Utilities untuk konversi koordinat.

**Location:** `utils/signature-coordinate-helper.js`

## Integration Steps

### Step 1: Update Signature Request Form

Ganti form lama dengan `SignaturePlacementForm`:

```javascript
// Import
import SignaturePlacementForm from "@/components/EsignBKD/SignaturePlacementForm";
import { signaturesToCoordinates } from "@/utils/signature-coordinate-helper";

// In your form component
const [signCoordinates, setSignCoordinates] = useState([]);

// Handler
const handleSignaturesChange = (coordinates) => {
  setSignCoordinates(coordinates);
  // Update form values
  form.setFieldsValue({
    sign_coordinate: JSON.stringify(coordinates)
  });
};

// Render
<SignaturePlacementForm
  pdfBase64={pdfBase64}
  signerName={currentUser?.nama || "Saya"}
  onSignaturesChange={handleSignaturesChange}
  canEdit={true}
/>
```

### Step 2: Update Form Submission

Pada saat submit form, kirim `sign_coordinate` bukan `sign_pages`:

```javascript
const handleSubmit = async (values) => {
  const data = {
    ...values,
    sign_coordinate: signCoordinates, // Array of coordinate objects
    // Remove sign_pages if exists
  };

  await createSignatureRequest(data);
};
```

### Step 3: Update Backend Service

#### signature-requests.service.js
```javascript
export const createSignatureRequest = async (documentId, data, userId, mc = null) => {
  const { sign_coordinate } = data;

  // sign_coordinate format:
  // [{
  //   page: 1,
  //   tag: "$",
  //   originX: 306,
  //   originY: 433,
  //   found: true,
  //   pageWidth: 612,
  //   pageHeight: 792,
  //   signatureWidth: 75,
  //   signatureHeight: 37.5,
  //   signerName: "John Doe"
  // }]

  const detail = await createSelfSignDetail(
    signatureRequest.id,
    userId,
    JSON.stringify([]), // sign_pages empty
    "$", // tag_coordinate for BSrE compatibility
    notes,
    trx,
    sign_coordinate // Pass coordinates
  );
};
```

### Step 4: Display Signatures (View Mode)

Untuk menampilkan signatures yang sudah di-set (read-only):

```javascript
import { coordinatesToSignatures } from "@/utils/signature-coordinate-helper";

// Convert from database
const savedCoordinates = JSON.parse(signatureDetail.sign_coordinate);
const signatures = coordinatesToSignatures(savedCoordinates);

// Display
<PdfViewer
  pdfBase64={pdfBase64}
  enableSignaturePlacement={true}
  signatures={signatures}
  canEdit={false} // Read-only
/>
```

## Data Format

### Signatures Array (Frontend)
```javascript
[
  {
    id: "sig_1234567890",
    page: 1,
    position: { x: 100, y: 200 }, // pixels
    signerName: "John Doe"
  },
  {
    id: "sig_1234567891",
    page: 2,
    position: { x: 150, y: 250 },
    signerName: "John Doe"
  }
]
```

### sign_coordinate (Database/API)
```javascript
[
  {
    page: 1,
    tag: "$", // For BSrE compatibility
    originX: 75, // PDF points
    originY: 150, // PDF points
    found: true,
    pageWidth: 612,
    pageHeight: 792,
    signatureWidth: 75,
    signatureHeight: 37.5,
    signerName: "John Doe"
  }
]
```

## Statistics Helper

```javascript
import { getSignatureCountByPage, getTotalSignatureCount } from "@/utils/signature-coordinate-helper";

const counts = getSignatureCountByPage(signatures);
// { page1: 2, page2: 1, page3: 1 }

const total = getTotalSignatureCount(signatures);
// 4
```

## Multi-Signer Support

Untuk pengajuan dengan multiple signers:

```javascript
// Pembuat pengajuan set semua signatures
const signers = [
  { id: "user1", name: "Reviewer 1" },
  { id: "user2", name: "Approver 1" },
  { id: "user3", name: "Signer 1" },
];

// Set signatures dengan nama signer
<SignaturePlacementForm
  pdfBase64={pdfBase64}
  signerName={selectedSigner.name} // Ganti sesuai signer yang dipilih
  onSignaturesChange={(coords) => {
    // Save coordinates with signer info
    const coordsWithSigner = coords.map(c => ({
      ...c,
      signerId: selectedSigner.id,
      signerName: selectedSigner.name
    }));
    setSignCoordinates(prev => [...prev, ...coordsWithSigner]);
  }}
/>
```

## Important Notes

### BSrE Limitation
⚠️ **BSrE API TIDAK SUPPORT absolute positioning via originX/originY!**

BSrE akan **IGNORE** parameter `originX/originY` yang dikirim. Logo akan tetap muncul di posisi default BSrE.

**Solusi:**
1. Drag-drop hanya untuk **preview/dokumentasi** posisi yang diinginkan
2. Simpan koordinat untuk **referensi visual**
3. BSrE tetap pakai **tag-based** positioning (koordinat di-ignore)

### Alternative Approaches
1. **Manual Placement:** User lihat PDF, catat koordinat, input manual
2. **Post-processing:** Setelah BSrE sign, overlay signature di koordinat yang benar
3. **Different E-sign Provider:** Cari provider yang support absolute coordinates

## Validation

```javascript
import { validateSignatures } from "@/utils/signature-coordinate-helper";

const isValid = validateSignatures(signatures);
if (!isValid) {
  message.error("Signature placement tidak valid!");
  return;
}
```

## Testing Checklist

- [ ] Add signature via button
- [ ] Drag signature to different positions
- [ ] Remove signature
- [ ] Navigate between pages (signatures persist)
- [ ] Submit form (coordinates saved correctly)
- [ ] View saved signatures (read-only mode)
- [ ] Multi-signer workflow
- [ ] Signature count statistics
- [ ] Validation

## Files Modified/Created

### Created:
- `src/components/EsignBKD/DraggableSignature.js`
- `src/components/EsignBKD/SignaturePlacementForm.js`
- `utils/signature-coordinate-helper.js`
- `SIGNATURE_PLACEMENT_INTEGRATION.md` (this file)

### Modified:
- `src/components/EsignBKD/PdfViewer.js` - Added signature overlay support

## Next Steps

1. **Integrate dengan form tanda tangan mandiri**
   - Update `KnowledgeFormUserContents.js` atau form yang relevan
   - Ganti tag input dengan `SignaturePlacementForm`

2. **Integrate dengan form pengajuan multi-signer**
   - Pembuat pengajuan set posisi untuk semua signer
   - Tampilkan preview signatures dengan nama signer

3. **Update backend**
   - Terima `sign_coordinate` dari frontend
   - Simpan ke database (JSONB column)
   - Return coordinates saat get detail

4. **Testing**
   - Test end-to-end workflow
   - Verify data saved correctly
   - Test view mode

## Support

Jika ada issue atau pertanyaan, check:
1. Console logs untuk errors
2. Network tab untuk API requests
3. Database untuk data format
