import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, VerticalAlign, BorderStyle, PageOrientation } from "docx";
import { saveAs } from "file-saver";
import { format } from 'date-fns';
import { Evaluation } from "../types";

export const downloadEvaluationDocx = (evaluation: Evaluation) => {
  const year = new Date(evaluation.date).getFullYear();

  // Format grade and term to ensure they contain "Classe" and "Trimestre"
  const formattedGrade = evaluation.grade.toLowerCase().includes('classe') 
    ? evaluation.grade 
    : `${evaluation.grade} Classe`;
    
  const formattedTerm = evaluation.term.toLowerCase().includes('trimestre') 
    ? evaluation.term 
    : `${evaluation.term} Trimestre`;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            size: 24, // 12pt
            color: "000000",
            font: "Arial",
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `${evaluation.schoolType} ${evaluation.schoolName}`, bold: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${evaluation.evaluationType} de ${evaluation.subject} - ${formattedGrade} - ${formattedTerm} - ${year}`, bold: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Data: ${format(new Date(evaluation.date), 'dd/MM/yyyy')}`, bold: true }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Duração: ${evaluation.duration} min`, bold: true }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
          }),

          ...(evaluation.readingText && (evaluation.readingText.title || (evaluation.readingText.paragraphs && evaluation.readingText.paragraphs.length > 0)) ? [
            new Paragraph({
              children: [
                new TextRun({ text: "Texto", bold: true }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            ...(evaluation.readingText.title ? [
              new Paragraph({
                text: evaluation.readingText.title,
                heading: "Heading2",
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
            ] : []),
            ...(evaluation.readingText.author ? [
              new Paragraph({
                children: [
                  new TextRun({ text: evaluation.readingText.author, italics: true }),
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 },
              })
            ] : []),
            ...(evaluation.readingText.paragraphs || []).map(p => new Paragraph({
              text: p,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            })),
            new Paragraph({ text: "", spacing: { after: 400 } }),
          ] : []),

          ...evaluation.questions.map((q) => {
            return new Paragraph({
              children: [
                new TextRun({ text: `${q.number}. `, bold: true }),
                new TextRun({ text: q.question }),
                new TextRun({ text: `\t(${q.totalScore} val.)`, bold: true }),
              ],
              spacing: { after: 400 },
            });
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Avaliacao_${evaluation.subject}_${evaluation.date}.docx`);
  });
};

export const downloadEvaluationGridDocx = (evaluation: Evaluation) => {
  const doc = new Document({
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
            text: "Grelha de Avaliação",
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
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
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `${evaluation.schoolType} ` }), new TextRun({ text: evaluation.schoolName, bold: true })] }),
                      new Paragraph({ children: [new TextRun({ text: "Nome do Professor:", bold: true }), new TextRun({ text: ` ${evaluation.teacher}` })] }),
                      new Paragraph({ children: [new TextRun({ text: "Disciplina:", bold: true }), new TextRun({ text: ` ${evaluation.subject}` })] }),
                      new Paragraph({ children: [new TextRun({ text: "Classe:", bold: true }), new TextRun({ text: ` ${evaluation.grade}` })] }),
                      new Paragraph({ children: [new TextRun({ text: "Tipo de Avaliação:", bold: true }), new TextRun({ text: ` ${evaluation.evaluationType}` })] }),
                    ]
                  }),
                  new TableCell({ 
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Data:", bold: true }), new TextRun({ text: ` ${format(new Date(evaluation.date), 'dd/MM/yyyy')}` })], alignment: AlignmentType.RIGHT }),
                      new Paragraph({ children: [new TextRun({ text: "Trimestre:", bold: true }), new TextRun({ text: ` ${evaluation.term}` })], alignment: AlignmentType.RIGHT }),
                      new Paragraph({ children: [new TextRun({ text: "Turmas:", bold: true }), new TextRun({ text: ` ${evaluation.classes}` })], alignment: AlignmentType.RIGHT }),
                      new Paragraph({ children: [new TextRun({ text: "Duração:", bold: true }), new TextRun({ text: ` ${evaluation.duration} min` })], alignment: AlignmentType.RIGHT }),
                    ]
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 400 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: {
              top: 150,
              bottom: 150,
              left: 150,
              right: 150,
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({ rowSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Nº", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ rowSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Nível de Conhecimento", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ rowSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Conteúdo", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ rowSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Objectivo", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ rowSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Pergunta", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ rowSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Resposta Possível", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Cotação", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                ],
              }),
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Parcial", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true })], alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                ]
              }),
              ...evaluation.questions.map(q => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: q.number.toString(), alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [new Paragraph({ text: q.knowledgeLevel, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [new Paragraph({ text: q.content, alignment: AlignmentType.JUSTIFIED })], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [new Paragraph({ text: q.objective, alignment: AlignmentType.JUSTIFIED })], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [new Paragraph({ text: q.question, alignment: AlignmentType.JUSTIFIED })], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [new Paragraph({ text: q.possibleAnswer, alignment: AlignmentType.JUSTIFIED })], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [new Paragraph({ text: q.partialScore.toString(), alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                    new TableCell({ children: [new Paragraph({ text: q.totalScore.toString(), alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                  ]
                })
              )
            ],
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Grelha_Avaliacao_${evaluation.subject}_${evaluation.date}.docx`);
  });
};
