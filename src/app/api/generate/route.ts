import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const formData = await req.formData();
    const materi = formData.get('materi') as string;
    const tingkatKesulitan = formData.get('tingkatKesulitan') as string;
    const file = formData.get('file') as File | null;

    if (!tingkatKesulitan || (!materi && !file)) {
      return NextResponse.json({ error: 'Materi/File and tingkatKesulitan are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Kamu adalah asisten dosen. Buat kuis pilihan ganda berjumlah 10 soal dari materi berikut. Tingkat kesulitan: ${tingkatKesulitan}. Output HARUS berformat JSON murni berupa array of objects. Setiap object berisi key: 'pertanyaan', 'opsi' (array 4 string), 'jawabanBenar' (string, harus sama persis dengan salah satu opsi), 'penjelasan' (maksimal 2 kalimat, langsung to the point sebutkan keywordnya), dan 'topik' (keyword topik soal tersebut).`;

    if (materi) {
      prompt += `\n\nMateri:\n${materi}`;
    }

    let payload: any[] = [prompt];

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');

      payload.push({
        inlineData: {
          data: base64String,
          mimeType: file.type || 'application/pdf', // fallback
        }
      });
    }

    const result = await model.generateContent(payload);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown formatting if the model wraps the JSON in ```json ... ```
    if (text.includes('\`\`\`json')) {
      text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    } else if (text.includes('\`\`\`')) {
      text = text.replace(/\`\`\`/g, '');
    }

    const parsedData = JSON.parse(text.trim());

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz.' }, { status: 500 });
  }
}
