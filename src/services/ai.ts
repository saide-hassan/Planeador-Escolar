import { GoogleGenAI } from "@google/genai";
import { LessonPlan, LessonPlanInput } from "../types";

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A chave da API (GEMINI_API_KEY) não está configurada. Por favor, configure-a no painel do Netlify.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate content with retry logic
async function generateContentWithRetry(ai: GoogleGenAI, model: string, contents: any, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      // Add a timeout of 45 seconds to prevent hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout: A IA demorou muito para responder.")), 45000)
      );
      
      const apiPromise = ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          responseMimeType: "application/json",
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response;
    } catch (error: any) {
      // Check for 503 Service Unavailable or 429 Too Many Requests or Timeout
      if (error?.status === 503 || error?.code === 503 || error?.status === 429 || error?.code === 429 || error?.message?.includes("Timeout")) {
        console.warn(`Tentativa ${i + 1} falhou com erro ${error.status || error.code || error.message}. Tentando novamente...`);
        if (i === retries - 1) throw error; // If last attempt, throw error
        
        // Exponential backoff: 3s, 6s
        await delay(3000 * Math.pow(2, i));
      } else {
        throw error; // Throw other errors immediately
      }
    }
  }
}

export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlan> {
  // Using gemini-3-flash-preview for better stability and speed
  const model = "gemini-3-flash-preview";
  const ai = getAiClient();
  
  const prompt = `
    Você é um especialista em pedagogia com vasta experiência no currículo moçambicano (1ª à 12ª classe).
    Sua tarefa é criar um plano de aula detalhado com base nos seguintes dados fornecidos pelo professor:

    Escola: ${input.school}
    Disciplina: ${input.subject}
    Data: ${input.date}
    Unidade Temática: ${input.unit}
    Classe: ${input.grade}
    Tema: ${input.topic}
    Duração: ${input.duration} minutos
    Professor: ${input.teacher}
    Materiais: ${input.materials}
    ${input.otherDetails ? `Outros Detalhes/Especificações: ${input.otherDetails}` : ''}

    Contexto sobre as Funções Didácticas (Use como base para estruturar o conteúdo):
    
    1. Introdução e Motivação:
       Esta função didáctica ocorre no princípio de uma aula e é considerado como o desenhador para o sucesso de uma aprendizagem dos alunos. Ela prepara o aluno para seguir o ritmo da aula. Segundo Libâneo (2004) a introdução e motivação pode incluir perguntas do professor para monitorar o nível de percepção das matérias transmitidas no passado recente e pronto para a recepção de um conhecimento novo. Neste item, a função do professor moderador é estimular os alunos a trazer novas abordagens da matéria, fazendo com que o aluno saiba conectar o aprendizado com a vida real. Por conseguinte, as correcções dos trabalhos de casa, são aqui efectivados, servindo de reforço e consolidação da aula passada.
       Resumindo:
       - Criar disposição e ambiente favorável aos alunos, que possam assegurar o bom decurso do processo de ensino e processo de aprendizagem.
       - Consolidar o nível inicial e orientar o aluno para o novo conteúdo.
       - Motivar permanentemente com o fim de manter o interesse e a atenção do aluno através de avaliação de estímulos.

    2. Mediação e Assimilação:
       Segundo Piletti (1991) mediação pode ser definida como uma ação concreta do processo de ensino e aprendizagem em que o professor passa os conteúdos e envolve diálogo e no final faz uma síntese da aula e pode-se entender também como sendo um processo em que o professor orienta o processo de ensino e aprendizagem em que são necessários elementos como: professor, aluno, conteúdo, material didático, método e fins a atingir. Nesta função didática, o professor explica detalhadamente os conteúdos contidos no seu plano de aula com exemplos concretos para sua maior percepção. Nisto, o professor deve fazer entender a matéria com uma boa análise, síntese, sistematização, generalização e demonstração. E é exigido a executar o que planejou, mostrando suas habilidades, exercendo mais do que em outras fases a sua função de liderança, motivando a aprendizagem, utilizando métodos, recursos e procedimentos, procurando criar uma situação favorável ao processo de ensino e aprendizagem.

    3. Domínio e Consolidação:
       Para Piletti (1991) define o domínio e consolidação como sendo um momento da aula em que se realizam ações com a finalidade de sistematizar, refletir e aplicar o que foi lecionado e ainda são realizados exercícios de consolidação que leva a fixação e formação de habilidades e hábitos, bem como auxiliam a sistematização da matéria. O professor como moderador, orienta a resolução de alguns exercícios de consolidação, acompanhando e esclarecendo algumas dúvidas que possam aparecer (Piletti, 2004). Para Caires & Almeida (2001) o professor com a colaboração dos alunos faz o resumo apropriado que ajudará o aluno no seu estudo individual, pois o domínio constitui a formação e desenvolvimento de habilidades por parte dos instruendos, enquanto a consolidação consiste em recordar a matéria sobre habilidades e conhecimentos. Nesta fase, pretende-se alcançar o aprimoramento do já (não) novo saber nos alunos, para isso, o professor deve criar condições necessárias de retenção e compreensão das matérias lecionada através de exercícios e atividades práticas para solidificar a compreensão - repetição, sistematização e aplicação.

    4. Controle e Avaliação:
       Para Dias et. Al (2010) se tratando da última função didática, o professor na qualidade de mediador da aula faz uma análise crítica de modo a compreender e interpretar os fenômenos educacionais observados na planificação, certificando o nível de percepção da matéria partilhada, fazendo algumas perguntas para averiguar o entendimento, como maneira de criar mais interesse nos alunos e por fim, avaliar se conseguiu alcançar os objetivos por si planificados. De acordo com Libânio (1994) o mediador conduz efetivamente o processo de ensino e processo de aprendizagem, conhecendo permanentemente o grau das dificuldades dos seus alunos na compreensão da matéria. Este controle sistemático consistirá no acompanhamento da aprendizagem, avaliando-se e avaliando as atividades dos alunos em função dos objetivos preconizados. Nessa lógica, a avaliação não deve ser entendida como um fim em si, mas um meio para averiguar as mudanças de comportamento, pois permite identificar os alunos que necessitam de atenção especial e se possível, uma futura reformulação do mesmo trabalho com a adopção de procedimento para sanar tais dificuldades. Isto só pode acontecer com o professor que conhece e convive bem com os seus alunos.

    ${(input.subject.toLowerCase().includes('português') || input.subject.toLowerCase().includes('portugues')) && (input.grade.includes('7') || input.grade.includes('8')) ? `
    CONTEXTO ESPECÍFICO PARA LÍNGUA PORTUGUESA (7ª e 8ª Classe - Currículo Moçambicano):
    Baseie-se na seguinte estrutura de Unidades Temáticas típica dos manuais escolares fornecidos:
    
    ESTRUTURA CÍCLICA DAS UNIDADES:
    1. Textos Normativos:
       - 7ª Classe: Regulamento Escolar (estrutura, linguagem), Sujeitos (simples/composto), Preposições (a, de, com).
       - 8ª Classe: Regulamentos (escola, concursos), Voz Passiva, Concordância nominal e verbal.
    
    2. Textos Administrativos:
       - 7ª Classe: Aviso (estrutura, linguagem), Particípio passado (avisar, informar), Voz passiva de 'se' e 'ser'.
       - 8ª Classe: Requerimento (estrutura, linguagem), Verbos regulares (conjuntivo), Formas de tratamento.
    
    3. Textos Jornalísticos:
       - 7ª Classe: Notícia (estrutura, lead, corpo), Complementos circunstanciais (tempo, lugar, causa, fim).
       - 8ª Classe: Notícia e Fait-divers, Advérbios (tempo, lugar, modo), Numerais, Percentagens.
    
    4. Textos Multiuso:
       - 7ª Classe: Manuais Escolares, Instruções técnicas (medicamentos), Pronomes (demonstrativos, possessivos, interrogativos, indefinidos).
       - 8ª Classe: Instruções (aparelhos, receitas), Verbos transitivos/intransitivos, Modo Imperativo.
    
    5. Textos Literários:
       - 7ª Classe: Conto e Fábula, Texto Poético, Texto Dramático. Gramática: Adjetivos (graus), Palavras homónimas/parónimas, Derivação (prefixação/sufixação).
       - 8ª Classe: Narrativa (romance, conto), Poesia (estrofes, rima, versos), Texto Dramático. Gramática: Orações subordinadas, Verbos irregulares.
    
    IMPORTANTE: Ao gerar o plano, certifique-se de que o TEMA e o CONTEÚDO estejam alinhados com esta estrutura curricular específica para a classe selecionada.
    ` : ''}

    Requisitos Obrigatórios:
    1. Defina "Objectivos" claros e mensuráveis para a aula. Forneça-os como uma lista de frases separadas por quebras de linha (sem marcadores como "-" ou "1.", apenas o texto).
    2. Estruture a aula nas seguintes Funções Didácticas (exatamente com estes nomes):
       - Introdução e Motivação
       - Mediação e Assimilação
       - Domínio e Consolidação
       - Controlo e Avaliação
    3. Para cada função didáctica, defina:
       - Tempo (distribua os ${input.duration} minutos de forma lógica entre as fases).
       - Conteúdo (tópicos abordados).
       - Actividades do Professor (o que o professor faz).
       - Actividades do Aluno (o que o aluno faz).
       - Métodos: Escolha entre "Expositivo", "Elaboração Conjunta", "Trabalho Independente", "Trabalho em Grupo".
       - Obs: Alguma observação relevante (pode ser vazio).
    
    ${input.includeExercises ? `
    4. IMPORTANTE: Na fase de "Domínio e Consolidação", você DEVE incluir uma lista de 3 a 5 exercícios práticos relacionados ao tema para os alunos resolverem na aula. Liste-os explicitamente no campo "Conteúdo" ou "Actividades do Professor".
    ` : ''}

    ${input.includeHomework ? `
    5. IMPORTANTE: Na fase de "Controlo e Avaliação", você DEVE incluir explicitamente um TPC (Trabalho Para Casa) com 2 a 3 questões ou tarefas para os alunos. Liste-os no campo "Conteúdo" ou "Actividades do Professor".
    ` : ''}

    6. O conteúdo deve ser adequado à classe (${input.grade}) e restringir-se ESTRITAMENTE ao tema fornecido (${input.topic}). Não aborde outros assuntos não solicitados.
    7. A linguagem deve ser formal, pedagógica e em Português de Moçambique.

    Retorne APENAS um JSON válido com a seguinte estrutura, sem markdown ou texto adicional:
    {
      "objectives": "Texto dos objectivos...",
      "didacticFunctions": [
        {
          "name": "Introdução e Motivação",
          "time": "X min",
          "content": "...",
          "activities": {
            "teacher": "...",
            "student": "..."
          },
          "method": "...",
          "obs": "..."
        },
        ... (para as outras 3 funções)
      ],
      "contentSummary": "Texto dos apontamentos para o aluno copiar. IMPORTANTE: Use Markdown para formatar. Use # para Títulos, ## para Subtítulos e parágrafos bem estruturados. O texto deve ser EXTENSO e detalhado, cobrindo profundamente o tema, mas mantendo um nível de linguagem perfeitamente adequado à classe (${input.grade}) e à idade dos alunos. Não resuma excessivamente; explique os conceitos com clareza e profundidade pedagógica.",
      "exercisesList": ["Exercício 1...", "Exercício 2...", "Exercício 3..."],
      "homeworkList": ["TPC 1...", "TPC 2..."]
    }
  `;

  try {
    const parts: any[] = [
      { text: prompt }
    ];

    // Add attachments to the prompt
    if (input.attachments && input.attachments.length > 0) {
      input.attachments.forEach(file => {
        if (file.isText) {
          // Add text content directly to prompt parts
          parts.push({ text: `\n\n[ANEXO: ${file.name}]\n${file.data}\n[FIM DO ANEXO]` });
        } else {
          // Add binary content (image/pdf) as inlineData
          parts.push({
            inlineData: {
              mimeType: file.type,
              data: file.data
            }
          });
        }
      });
    }

    const response = await generateContentWithRetry(ai, model, { parts });

    let text = response.text;
    console.log("Resposta bruta da IA:", text); // Log para depuração

    if (!text) throw new Error("A IA retornou uma resposta vazia.");

    // Extract JSON block if it exists
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1].trim();
    } else {
      // Fallback: try to find the first { and last }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
    }

    try {
      const data = JSON.parse(text);
      return {
        ...input,
        objectives: data.objectives,
        didacticFunctions: data.didacticFunctions,
        contentSummary: data.contentSummary || "",
        exercisesList: data.exercisesList || [],
        homeworkList: data.homeworkList || []
      };
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      throw new Error("A IA gerou uma resposta inválida. Tente novamente.");
    }
  } catch (error: any) {
    console.error("Erro ao gerar plano de aula:", error);
    // Repassar a mensagem de erro original para a UI
    throw error;
  }
}
