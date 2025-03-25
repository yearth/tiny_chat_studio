import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { logToConsole } from "../../chat/utils/logger";

// 临时文件存储路径
const TEMP_UPLOAD_DIR = path.join(process.cwd(), "temp-uploads");

// 确保临时目录存在
async function ensureTempDirExists() {
  try {
    await mkdir(TEMP_UPLOAD_DIR, { recursive: true });
  } catch (error) {
    logToConsole(`创建临时目录失败: ${error}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 确保临时目录存在
    await ensureTempDirExists();

    // 获取表单数据
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "没有上传文件" },
        { status: 400 }
      );
    }

    // 处理每个文件
    const fileIds = await Promise.all(
      files.map(async (file) => {
        // 生成唯一ID
        const fileId = uuidv4();
        const fileExtension = path.extname(file.name);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = path.join(TEMP_UPLOAD_DIR, fileName);

        // 将文件内容转换为 Buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // 保存文件
        await writeFile(filePath, fileBuffer);

        // 返回文件信息
        return {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          path: fileName
        };
      })
    );

    // 返回文件ID列表
    return NextResponse.json({ 
      success: true, 
      fileIds: fileIds 
    });
  } catch (error) {
    logToConsole(`文件上传失败: ${error}`);
    return NextResponse.json(
      { error: "文件上传失败", details: error },
      { status: 500 }
    );
  }
}
