import { Injectable } from '@nestjs/common';

import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  getBookmarks(userId: number) {}

  getBookmarkById(userId: number, bookmarkId: number) {}

  createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto) {}

  editBookmarkById(
    userId: number,
    bookmarkId: number,
    editBookmarkById: EditBookmarkDto,
  ) {}

  deleteBookmarkById(userId: number, bookmarkId: number) {}
}
