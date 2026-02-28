import mammoth from 'mammoth';

export interface ProcessedFile {
  name: string;
  type: string;
  data: string;
  isText: boolean;
}

export async function processFile(file: File): Promise<ProcessedFile> {
  return new Promise(async (resolve, reject) => {
    try {
      // Handle DOCX - Extract Text
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve({
          name: file.name,
          type: 'text/plain',
          data: `--- Conteúdo do arquivo ${file.name} ---\n${result.value}\n--- Fim do arquivo ---`,
          isText: true
        });
        return;
      }

      // Handle Images and PDF - Convert to Base64
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({
            name: file.name,
            type: file.type,
            data: base64String,
            isText: false
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // Handle Plain Text
      if (file.type === 'text/plain') {
        const text = await file.text();
        resolve({
          name: file.name,
          type: 'text/plain',
          data: `--- Conteúdo do arquivo ${file.name} ---\n${text}\n--- Fim do arquivo ---`,
          isText: true
        });
        return;
      }

      reject(new Error(`Tipo de arquivo não suportado: ${file.type}`));
    } catch (error) {
      reject(error);
    }
  });
}
