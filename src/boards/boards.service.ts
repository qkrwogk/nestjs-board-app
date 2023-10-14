import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardsService {
  private boards = [];

  getAllBoards() {
    return this.boards;
  }
}
