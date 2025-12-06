import { Injectable } from '@nestjs/common';
import { ensureDir, writeFile } from 'fs-extra';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    await ensureDir(this.uploadPath);

    const fileExt = extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = join(this.uploadPath, fileName);

    await writeFile(filePath, file.buffer);

    // Assuming the app is served at the root, and we serve 'uploads' statically
    // We might need to adjust the URL based on how we configure ServeStaticModule
    // For now, let's assume it's served under /uploads route or root.
    // Let's configure ServeStatic to serve under /uploads prefix to avoid collisions.
    return { url: `/uploads/${fileName}` };
  }
}
