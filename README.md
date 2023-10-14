# 만들면서 배우는 NestJS 기초

학습메모 1을 활용하여 간단한 CRUD 게시판(Board Module)과 회원인증(Auth Module)을 직접 구현해보자.

## 프로젝트 생성

```bash
sudo npm i -g @nestjs/cli
```

npm client 설치 (글로벌로 설치함)

<img width="1169" alt="스크린샷 2023-10-14 오후 1 43 14" src="https://user-images.githubusercontent.com/138586629/275134253-1d86eb72-0c01-4fc6-9bc7-1c3a8d3051b2.png">

```bash
git clone https://github.com/qkrwogk/nestjs-board-app.git
```

github에 repository 하나 만들고 주소 따서 clone

```bash
cd nestjs-board-app
code .
```

프로젝트 폴더 들어가서 VSCode 켜자. 여기서부터 VSCode 터미널로 작업 고고

```bash
nest new ./
```

nest init project 생성. 이러면 기본 파일들이 모두 세팅된다.

<img width="334" alt="스크린샷 2023-10-14 오후 1 55 36" src="https://user-images.githubusercontent.com/138586629/275139337-4b75beb2-fa2d-4b24-982c-a396268aa6bf.png">

```ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

여기서 test 관련 파일, 자동으로 생성된 controllers와 service 파일들을 모두 제거하고,
app.module.ts에서 등록되어 있는 부분들도 모두 깔끔하게 제거해준다. 여기서부터 새로 만들어갈 예정!

## boards module, controller, service 생성

```bash
nest g module boards
```

nest g module boards 명령으로 boards란 이름의 모듈을 generate!
이러면 app.module.ts에 등록도 자동으로 되고 모듈 폴더 안에 boards.module.ts 파일이 생성된다.
아니 이거 너무너무 편한데? 귀찮아할게 아니라 이게 그냥 더 쉬운거네

```bash
nest g controller boards --no-spec
```

비슷한 명령으로 controller를 생성해줌.
`--no-spec`은 test 코드를 안만든다는 거고, 빼면 test코드도 같이 생성해줌.

```bash
nest g service boards --no-spec
```

또 비슷한 명령으로 service를 생성해줌.
service는 @Injectable이라는 데코레이터로 의존성 주입이 가능한 "Provider"의 일종임
실제로 boards controller에서 사용할 수 있도록 의존성 주입 처리를 해줘야 하는데,

```ts
// boards.controller.ts
import { Controller } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
}
```

이렇게 constructor 한줄 추가하면 됨. (ts 문법)

## 새로운 서비스 메소드 추가해보기

```ts
// boards.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardsService {
  private boards = [];

  getAllBoards() {
    return this.boards;
  }
}
```

요렇게 새로운 메소드를 하나 추가해본다. `getAllBoards()`. boards 배열을 반환하는 녀석.

```ts
// boards.controller.ts

import { Controller, Get } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  getAllBoards() {
    return this.boardsService.getAllBoards();
  }
}
```

이걸 사용하려면 controller도 편집해줘야 한다. `@Get()`으로 GET Method에 등록하고,
controller에서도 메소드를 하나 만들어 this.boardService.getAllBoards()를 호출해서 결과값 그대로 패스.
메소드 이름은 보통 그냥 같은걸로 해주나봄. 안헷갈리게

```bash
npm run start:dev
```

<img width="808" alt="스크린샷 2023-10-14 오후 2 25 08" src="https://user-images.githubusercontent.com/138586629/275143008-7116f627-bcf6-4bfb-ba3b-d809f2f2c23e.png">

이렇게 npm run start:dev로 실행해주면 nodemon처럼 동작한다. localhost:3000번으로 접근해보자.

자 이제 대망의 확인. `GET /boards`에 등록해준 거니까 브라우저에서 `http://localhost:3000/boards`로 가기만 하면 된다.

<img width="432" alt="스크린샷 2023-10-14 오후 2 26 26" src="https://user-images.githubusercontent.com/138586629/275143060-058310a1-6e79-4d01-9362-404135203dec.png">

정상적으로 빈 배열이 출력됨! 이제 끝났지뭐 이런 방식으로 API서버 만드는거네 쉽죠쉽죠?

## Board의 Model 정의하기

게시판의 요소들을 정리하여 타입도 정하고 해서 모델링을 하는거다.
ts의 interface나 일반 js class로 만들 수 있는데, class는 인스턴스를 만들수 있지만 이번엔 interface만 정의해봄.

```ts
// boards.model.ts
export interface Board {
  id: string;
  title: string;
  description: string;
  status: BoardStatus;
}

export enum BoardStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}
```

이렇게 하면 된다. id는 UUID를 사용할거라 string으로 한거고, BoardStatus는 PUBLIC/PRIVATE 값만 올 수 있도록 또 타입을 정의해준거임.

```ts
// boards.service.ts
import { Injectable } from '@nestjs/common';
import { Board } from './boards.model';

@Injectable()
export class BoardsService {
  private boards: Board[] = [];

  getAllBoards(): Board[] {
    return this.boards;
  }
}
```

```ts
// boards.controller.ts

import { Controller, Get } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.model';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  getAllBoards(): Board[] {
    return this.boardsService.getAllBoards();
  }
}
```

이후 service와 controller에서 `: Board[]`로 타입을 특정해주면 됨.

## 게시물 생성하기 (POST(Create))

`UUID`를 이용하여 사용할거기 때문에 uuid 모듈을 설치해준다.

```bash
npm i uuid
```

이제 service에 board를 만들어 boards배열에 집어넣는 메소드 createBoard()를 작성하자.

```ts
// boards.service.ts
import { Injectable } from '@nestjs/common';
import { Board, BoardStatus } from './boards.model';
import { v1 as uuid } from 'uuid';

@Injectable()
export class BoardsService {
  private boards: Board[] = [];
  ...
  createBoard(title: string, description: string) {
    const board: Board = {
      id: uuid(),
      title,
      description,
      status: BoardStatus.PUBLIC,
    };

    this.boards.push(board);
    return board;
  }
}
```

이제 Controller로 가서 `@Post()`로 POST 메소드에 등록을 해줘야 함.

```ts
// boards.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.model';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  ...
  @Post()
  createBoard(
    @Body('title') title: string,
    @Body('description') description: string,
  ): Board {
    return this.boardsService.createBoard(title, description);
  }
}
```

자, 이제 Postman으로 새로운 boards를 요청해보자.

<img width="786" alt="스크린샷 2023-10-14 오후 3 00 17" src="https://user-images.githubusercontent.com/138586629/275150015-8b635f1f-e033-40fb-965e-ae4956250814.png">

기가막히게 잘되어버림ㅎㅎ

## 게시물 생성을 위한 DTO 만들기

DTO(Data Transfer Object)를 만들어보자.
모델처럼 interface, class로 생성 가능하나, NestJS에서 class를 추천하므로 클래스 고고

<img width="256" alt="스크린샷 2023-10-14 오후 3 06 05" src="https://user-images.githubusercontent.com/138586629/275152121-b9820fde-466f-4aa6-acd1-2fcaa77b72ee.png">

이렇게 `/src/boards/dto/create-board.dto.ts`에 파일을 만들어주고

```ts
// create-board.dto.ts
export class CreateBoardDto {
  title: string;
  description: string;
}
```

이러면 끝 ㅇㅇ. 적용은 마찬가지로 Controller와 Service에 적용해주면 된다.

우리가 앞에서 만든 createBoard()의 인터페이스를 바꿔주는거임.

```ts
// boards.service.ts

import { Injectable } from '@nestjs/common';
import { Board, BoardStatus } from './boards.model';
import { v1 as uuid } from 'uuid';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  private boards: Board[] = [];
  ...
  createBoard(createBoardDto: CreateBoardDto) {
    const { title, description } = createBoardDto;
    const board: Board = {
      id: uuid(),
      title,
      description,
      status: BoardStatus.PUBLIC,
    };

    this.boards.push(board);
    return board;
  }
}
```

Service는 요렇게!

```ts
// boards.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.model';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  ...
  @Post()
  createBoard(@Body() createBoardDto: CreateBoardDto): Board {
    return this.boardsService.createBoard(createBoardDto);
  }
}
```

Controller는 요렇게! 훨씬 깔끔해졌죠?

현업에서의 클래스는 속성이 수백개가 있을 수 있는데, 그걸 하나하나 파싱해서 값 넣어주고 하면 수정할때 지옥인데,
이런식으로 DTO로 전달하고 원하는 값만 쏙쏙 빼는 형식이면 유지보수하기가 훨씬 편하다고 하더라.

## ID로 특정 게시물 가져오기, 지우기 (GET(Read), DELETE(Delete))

getBoardById(), deleteBoardById()라는 메소드를 서비스에서부터 만들어보자.

```ts
// boards.service.ts
import { Injectable } from '@nestjs/common';
import { Board, BoardStatus } from './boards.model';
import { v1 as uuid } from 'uuid';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  private boards: Board[] = [];
  ...
  getBoardById(id: string): Board {
    return this.boards.find((board) => board.id === id);
  }

  deleteBoardById(id: string): void {
    this.boards = this.boards.filter((board) => board.id !== id);
  }
}
```

Service는 요렇게!

```ts
// boards.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.model';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  ...
  @Get('/:id')
  groupBoardById(@Param('id') id: string): Board {
    return this.boardsService.getBoardById(id);
  }

  @Delete('/:id')
  deleteBoardById(@Param('id') id: string): void {
    return this.boardsService.deleteBoardById(id);
  }
}
```

Controller는 이렇게 하면 된다. 개껌이네 ㅋ

## 특정 게시물의 상태(PUBLIC/PRIVATE) 업데이트 기능 추가 (PATCH(Update))

```ts
// boards.service.ts
import { Injectable } from '@nestjs/common';
import { Board, BoardStatus } from './boards.model';
import { v1 as uuid } from 'uuid';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  private boards: Board[] = [];
  ...
  updateBoardStatus(id: string, status: BoardStatus): Board {
    const board = this.getBoardById(id);
    board.status = status;
    return board;
  }
}
```

서비스는 이렇게

```ts
// boards.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board, BoardStatus } from './boards.model';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  ...
  @Patch('/:id/status')
  updateBoardStatus(
    @Param('id') id: string,
    @Body('status') status: BoardStatus,
  ): Board {
    return this.updateBoardStatus(id, status);
  }
}
```

컨트롤러는 이렇게

## NestJS Pipes

- Pipe란?
  - @Injectable() 데코레이터로 주석이 달린 클래스
  - `data transformation`, `data validation`을 위해서 사용
- Data Transformation?
  - 데이터를 원하는 형식(Type 등)으로 변환
- Data Validation?
  - 데이터 유효성을 검증하여 올바르지 않으면 에러 반환
- Pipe 사용법 3가지
  - `Handler-level Pipes` : 핸들러 레벨에서 @UsePipes() 데코레이터로 적용
  - `Parameter-level Pipes` : 파라미터 레벨에서 특정 파라미터에만 적용
  - `Global Pipes` : main.ts에서 들어오는 모든 요청에 적용
- NestJs 기본 제공 Pipe
  - ValidationPipe
  - ParseIntPipe
  - ParseBoolPipe
  - ParseArrayPipe
  - ParseUUIDPipe
  - DefaultValuePipe

파이프를 이용해서 게시물 생성할 때 유효성 체크를 해보자.
필요한 모듈은 class-validator, class-transformer

```bash
npm i class-validatior class-transformer
```

사용법은 학습메모 2 참고하면 된다.

## Validation Pipe @IsNotEmpty 사용해보기

```ts
// create-board.dto.ts
import { IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
```

먼저 설치한 class-validator를 이용해서 `@IsNotEmpty()` 데코레이터를 title 속성과 description 속성에 적용해줘야 한다.

```ts
// boards.controller.ts
import {
  ...
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
...

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  ...
  @Post()
  @UsePipes(ValidationPipe)
  createBoard(@Body() createBoardDto: CreateBoardDto): Board {
    return this.boardsService.createBoard(createBoardDto);
  }
  ...
}
```

이후 createBoard()메소드에 데코레이터로 `@UsePipes(ValidationPipe)`를 달아준다.

자 이제 빈 값을 넣었을 때 Validation Check를 하는지 테스트해보자.

<img width="781" alt="스크린샷 2023-10-14 오후 4 31 04" src="https://user-images.githubusercontent.com/138586629/275163200-8d3db6b6-68ba-4f91-b365-ecbf998b5508.png">

적용 전. 그냥 create가 되어버림.

<img width="790" alt="스크린샷 2023-10-14 오후 4 35 43" src="https://user-images.githubusercontent.com/138586629/275163391-79ec8c50-326e-4cae-bc59-8bdb85e96f85.png">

적용 후. 에러뜨고 create가 안됨! 굳!!

이런식이면 예외처리도 어어어엄청 편할 것 같다.. 이제까지 한 노가다들이여 안녕..

## 찾는 게시물이 없을 때 예외 처리

`NotFoundException()`이라는 객체로 에러를 보내줄 수 있음.
(Error 클래스 상속한 거인듯)

```ts
// boards.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
...

@Injectable()
export class BoardsService {
  private boards: Board[] = [];
  ...
  getBoardById(id: string): Board {
    const found = this.boards.find((board) => board.id === id);

    if (!found) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
    return found;
  }
  ...
}
```

자 테스트해보자. 이상한 uuid값으로 조회를 해보면 됨.

<img width="791" alt="스크린샷 2023-10-14 오후 4 41 12" src="https://user-images.githubusercontent.com/138586629/275163797-69c1d28c-4df5-4db7-890a-22a1611e6636.png">

적용 전. 아주그냥 빈칸.

<img width="796" alt="스크린샷 2023-10-14 오후 4 44 43" src="https://user-images.githubusercontent.com/138586629/275163813-624a9cd6-ba71-490a-aa0e-b08d86a48360.png">

적용 후. 원하는 에러메세지까지 출력해줌!

## 없는 게시물을 지우려 할 때 예외 처리

getBoardById()를 그냥 호출만 해줘도 알아서 위에서 만든 에러를 보내줄거여!

```ts
// boards.service.ts
...

@Injectable()
export class BoardsService {
  private boards: Board[] = [];
  ...
  deleteBoardById(id: string): void {
    const found = this.getBoardById(id);
    this.boards = this.boards.filter((board) => board.id !== found.id);
  }
  ...
}
```

뭔말인지 알겠지?

<img width="790" alt="스크린샷 2023-10-14 오후 4 48 39" src="https://user-images.githubusercontent.com/138586629/275164586-b66d41b7-831f-4af6-8782-8864783a5c46.png">

굳굳

## 커스텀 파이프를 이용한 유효성 체크

PipeTransform이라는 인터페이스를 새롭게 만들 파이프에 구현해줘야 함.
(class ... implements PipeTransform)

- transform() 메소드의 파라미터
  - value : 처리가 된 인자의 값
  - metadata : 인자에 대한 메타데이터

status옵션이 PRIVATE 아니면 PUBLIC만 올 수 있게 파이프를 만들어주자.

<img width="255" alt="스크린샷 2023-10-14 오후 4 56 16" src="https://user-images.githubusercontent.com/138586629/275172082-83d33d61-a28c-4af4-9609-90a8803e6b43.png">

`/src/pipes/board-status-validation.pipe.ts` 생성

```ts
// board-status-validation.pipe.ts
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { BoardStatus } from '../boards.model';

export class BoardStatusValidationPipe implements PipeTransform {
  readonly StatusOptions = [BoardStatus.PRIVATE, BoardStatus.PUBLIC];

  transform(value: any) {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} isn't in the status options`);
    }

    return value;
  }

  private isStatusValid(status: any) {
    const index = this.StatusOptions.indexOf(status);
    return index !== -1;
  }
}
```

isStatusValid() 메소드의 indexOf()는 없는 값이면 -1을 반환한다.
이걸 이용해서 PUBLIC, PRIVATE 중 하나의 값인지를 체크하는거임.

그리고 이번엔 BadRequestException 에러 객체를 이용한다.

```ts
// boards.controller.ts
...
import { BoardStatusValidationPipe } from './pipes/board-status-validation.pipe';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}
  ...
  @Patch('/:id/status')
  updateBoardStatus(
    @Param('id') id: string,
    @Body('status', BoardStatusValidationPipe) status: BoardStatus,
  ): Board {
    return this.updateBoardStatus(id, status);
  }
}
```

자 이제 게시글 하나 생성해서, 그 값을 정상적으로 한번, 비정상적으로 한번 변경해보자.

<img width="794" alt="스크린샷 2023-10-14 오후 5 23 31" src="https://user-images.githubusercontent.com/138586629/275173057-f6642a9e-e7e6-42be-abdc-c83b2847b101.png">

생성했고, 이 아이디를 이용해 업데이트

<img width="787" alt="스크린샷 2023-10-14 오후 5 23 20" src="https://user-images.githubusercontent.com/138586629/275173063-fa16a38f-f09f-4d3b-93bc-71bb2cbf7545.png">

정상적으로 에러 출력. 이번엔 PRIVATE으로 바꿔보자

<img width="789" alt="스크린샷 2023-10-14 오후 5 26 09" src="https://user-images.githubusercontent.com/138586629/275173204-43a19d9c-68a1-4b60-9888-30016b0ea548.png">

아니 이거 왜 에러뜸??

<img width="1071" alt="스크린샷 2023-10-14 오후 5 33 28" src="https://user-images.githubusercontent.com/138586629/275173542-7572985d-7e2b-45ed-b30b-e707af474592.png">

에라이

---

문제 해결

```ts
// boards.controller.ts
@Patch('/:id/status')
updateBoardStatus(
  @Param('id') id: string,
  @Body('status', BoardStatusValidationPipe) status: BoardStatus,
): Board {
  return this.boardsService.updateBoardStatus(id, status);
}
```

`this.boardsService.updateBoardStatus`이거 걍 오타난거였음.. ㅠ

<img width="802" alt="스크린샷 2023-10-14 오후 5 38 27" src="https://user-images.githubusercontent.com/138586629/275173714-7eeb54e6-9f3b-431d-92cc-a364c1c49610.png">

정상적으로 잘 바뀜! 근데 이거 보니까 `npm run start:dev`하니
console.log()가 정상 작동을 안하네..? 후 로그 찍어보는거 좀 찾아봐야겠다.

## 학습메모

1. [따라하면서 배우는 NestJS](https://www.youtube.com/watch?v=3JminDpCJNE&t=1677s)
2. [class-validator 사용법](https://github.com/typestack/class-validator#manual-validation)
