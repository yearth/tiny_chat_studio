import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile, stat } from "fs/promises";
import { logToConsole } from "../../../chat/utils/logger";

type tParams = Promise<{ fileId: string }>;

// 临时文件存储路径
const TEMP_UPLOAD_DIR = path.join(process.cwd(), "temp-uploads");

export async function GET(req: NextRequest, { params }: { params: tParams }) {
  try {
    const fileId = (await params).fileId;

    if (!fileId) {
      return NextResponse.json({ error: "文件ID不能为空" }, { status: 400 });
    }

    // 查找匹配的文件（支持任何扩展名）
    const directoryPath = path.join(TEMP_UPLOAD_DIR);

    // 尝试找到匹配的文件
    const filePattern = new RegExp(`^${fileId}\\.[^\\.]+$`);

    // 读取目录内容
    const fs = require("fs");
    const files = fs.readdirSync(directoryPath);

    // 查找匹配的文件
    const matchedFile = files.find((file: string) => filePattern.test(file));

    if (!matchedFile) {
      return NextResponse.json({ error: "找不到指定的文件" }, { status: 404 });
    }

    const filePath = path.join(directoryPath, matchedFile);

    // 获取文件信息
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      return NextResponse.json(
        { error: "请求的资源不是文件" },
        { status: 400 }
      );
    }

    // 读取文件内容
    const fileBuffer = await readFile(filePath);

    // 获取文件扩展名并推断 MIME 类型
    const extension = path.extname(matchedFile).toLowerCase();
    let contentType = "application/octet-stream"; // 默认

    // 简单的 MIME 类型映射
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    if (extension in mimeTypes) {
      contentType = mimeTypes[extension];
    }

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename=${encodeURIComponent(
          matchedFile
        )}`,
      },
    });
  } catch (error) {
    logToConsole(`获取文件失败: ${error}`);
    return NextResponse.json(
      { error: "获取文件失败", details: error },
      { status: 500 }
    );
  }
}
