import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, VerticalAlign, BorderStyle, PageOrientation } from "docx";
import { saveAs } from "file-saver";
import { format } from 'date-fns';
import { LessonPlan } from "../types";

export const downloadDocx = (plan: LessonPlan) => {
  // A subtle academic blue for table headers (Hex: D9E2F3 is a common "Light Blue" in Word themes)
  const tableHeaderColor = "D9E2F3";

  // Helper to create bold text labels
  const createLabel = (label: string, value: string) => {
    return new Paragraph({
      children: [
        new TextRun({ text: label, bold: true }),
        new TextRun({ text: ` ${value}` }),
      ],
      spacing: { after: 120 },
    });
  };

  // Create the main table rows
  const tableRows = [
    // Header Row
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Tempo", bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Função Didáctica", bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Conteúdo", bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Actividades", bold: true })], alignment: AlignmentType.CENTER })],
          columnSpan: 2, // Spans Professor and Aluno
          width: { size: 35, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Métodos", bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Obs.", bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
    // Sub-header Row for Activities
    new TableRow({
      children: [
        new TableCell({ children: [], width: { size: 10, type: WidthType.PERCENTAGE } }), // Empty for Tempo
        new TableCell({ children: [], width: { size: 15, type: WidthType.PERCENTAGE } }), // Empty for Função
        new TableCell({ children: [], width: { size: 20, type: WidthType.PERCENTAGE } }), // Empty for Conteúdo
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Professor", bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 17.5, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Aluno", bold: true })], alignment: AlignmentType.CENTER })],
          width: { size: 17.5, type: WidthType.PERCENTAGE },
          shading: { fill: tableHeaderColor },
        }),
        new TableCell({ children: [], width: { size: 10, type: WidthType.PERCENTAGE } }), // Empty for Métodos
        new TableCell({ children: [], width: { size: 10, type: WidthType.PERCENTAGE } }), // Empty for Obs
      ],
    }),
    // Data Rows
    ...plan.didacticFunctions.map((func) => 
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: func.time, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
          }),
          new TableCell({
            children: [new Paragraph({ text: func.name, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
          }),
          new TableCell({
            children: [new Paragraph({ text: func.content, alignment: AlignmentType.JUSTIFIED })],
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
          }),
          new TableCell({
            children: [new Paragraph({ text: func.activities.teacher, alignment: AlignmentType.JUSTIFIED })],
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
          }),
          new TableCell({
            children: [new Paragraph({ text: func.activities.student, alignment: AlignmentType.JUSTIFIED })],
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
          }),
          new TableCell({
            children: [new Paragraph({ text: func.method, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
          }),
          new TableCell({
            children: [new Paragraph({ text: func.obs || "" })],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
          }),
        ],
      })
    ),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 22, // 11pt
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
        children: [
          new Paragraph({
            text: "Plano de Aula",
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          // Header Info Grid
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [(() => {
                      // Dynamic School Label Logic
                      const isCollege = plan.school.startsWith("Colégio");
                      const label = isCollege ? "Colégio" : "Escola";
                      // Remove the prefix from the value if it exists to avoid duplication
                      const value = plan.school.replace(/^(Colégio|Escola)\s*/, "");
                      return createLabel(label, value);
                    })()], 
                    columnSpan: 2 
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createLabel("Disciplina:", plan.subject)] }),
                  new TableCell({ children: [createLabel("Data:", format(new Date(plan.date), 'dd/MM/yyyy'))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [(() => {
                      // Dynamic Unit Label Logic
                      // Expecting format "Roman: Name"
                      const parts = plan.unit.split(":");
                      if (parts.length > 1) {
                        const roman = parts[0].trim();
                        const name = parts.slice(1).join(":").trim();
                        return createLabel(`Unidade ${roman}:`, name);
                      }
                      return createLabel("Unidade:", plan.unit);
                    })()] 
                  }),
                  new TableCell({ children: [createLabel("Classe:", plan.grade)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Tema:", bold: true })],
                        spacing: { after: 120 },
                      }),
                      ...plan.topic.split('\n').map((line, index) => {
                        const cleanLine = line.trim();
                        if (!cleanLine) return null;
                        // First line is main topic, others are subtitles
                        return new Paragraph({
                          text: index === 0 ? cleanLine : `- ${cleanLine.replace(/^[-•*]\s*/, '')}`,
                          spacing: { after: 60 }
                        });
                      }).filter(p => p !== null) as Paragraph[]
                    ] 
                  }),
                  new TableCell({ children: [createLabel("Duração:", `${plan.duration} min`)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Objectivos:", bold: true })],
                        spacing: { after: 120 },
                      }),
                      ...plan.objectives.split('\n').map(obj => {
                        const cleanObj = obj.trim().replace(/^[-•*]\s*/, '');
                        if (!cleanObj) return null;
                        return new Paragraph({
                          text: `- ${cleanObj}`,
                          spacing: { after: 60 } // Small spacing between items
                        });
                      }).filter(p => p !== null) as Paragraph[]
                    ] 
                  }),
                  new TableCell({ children: [createLabel("Professor:", plan.teacher)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createLabel("Materiais:", plan.materials)], columnSpan: 2 }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }), // Spacer

          // Main Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),

          // Page Break for Content Summary
          new Paragraph({
            text: "",
            pageBreakBefore: true,
          }),

          // Content Summary Section
          new Paragraph({
            text: "Apontamentos",
            heading: "Heading2",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: plan.contentSummary,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
          }),

          // Exercises Section (if any)
          ...(plan.exercisesList && plan.exercisesList.length > 0 ? [
            new Paragraph({
              text: "Exercícios de Aplicação",
              heading: "Heading3",
              spacing: { before: 200, after: 200 },
            }),
            ...plan.exercisesList.map((ex, i) => 
              new Paragraph({
                text: `${i + 1}. ${ex}`,
                spacing: { after: 120 },
              })
            )
          ] : []),

          // Homework Section (if any)
          ...(plan.homeworkList && plan.homeworkList.length > 0 ? [
            new Paragraph({
              text: "TPC - Trabalho Para Casa",
              heading: "Heading3",
              spacing: { before: 200, after: 200 },
            }),
            ...plan.homeworkList.map((hw, i) => 
              new Paragraph({
                text: `${i + 1}. ${hw}`,
                spacing: { after: 120 },
              })
            )
          ] : []),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Plano_de_Aula_${plan.subject}_${plan.date}.docx`);
  });
};
