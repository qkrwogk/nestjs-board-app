# 만들면서 배우는 NestJS 기초

학습메모 1을 활용하여 간단한 CRUD 게시판(Board Module)과 회원인증(Auth Module)을 직접 구현해보자.

## 목차

- [x] 프로젝트 생성
- [x] boards module, controller, service 생성
- [x] 새로운 서비스 메소드 추가해보기
- [x] Board의 Model 정의하기
- [x] 게시물 생성하기 (POST(Create))
- [x] 게시물 생성을 위한 DTO 만들기
- [x] ID로 특정 게시물 가져오기, 지우기 (GET(Read), DELETE(Delete))
- [x] 특정 게시물의 상태(PUBLIC/PRIVATE) 업데이트 기능 추가 (PATCH(Update))
- [x] NestJS Pipes
- [x] Validation Pipe @IsNotEmpty 사용해보기
- [x] 찾는 게시물이 없을 때 예외 처리
- [x] 없는 게시물을 지우려 할 때 예외 처리
- [x] 커스텀 파이프를 이용한 유효성 체크
- [x] MySQL DB 생성, TypeORM 사용법
- [x] Entity 생성하기
- [x] Repository 만들기
- [x] CRUD 구현하기
- [x] 인증
- [x] 게시물에 접근하는 권한 처리
- [x] 로그 남기기
- [x] 설정 및 마무리

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

---

찾아봄. 학습메모 3 참고

```ts
import { Logger } from '@nestjs/common';

Logger.log('info');
Logger.warn('warning');
Logger.error('something went wrong! ', error);
```

요런식으로 찍어보면 된단다. 이제 이걸 이용하자고!

## MySQL DB 생성, TypeORM 사용법

강의에선 Postgres를 사용하라고 나오는데, 나는 MySQL을 깊게파는 짱짱맨이니
MySQL 데이터베이스를 새로 생성해서 권한을 주자.

<img width="336" alt="스크린샷 2023-10-25 오후 8 09 59" src="https://user-images.githubusercontent.com/138586629/277983048-89baf0e3-a293-427d-af06-53536e92b984.png">

<img width="560" alt="스크린샷 2023-10-25 오후 8 15 09" src="https://user-images.githubusercontent.com/138586629/277985191-75973a7f-f506-49c9-b20d-0ba9b959a206.png">

완벽!

TypeORM은 뭐 흔한 ORM과 똑같다. 사용방법만 알면 훨씬 쉬울테니 알아나 보자.
(물론 미래를 생각하면 쿼리위주로 하는 습관을 들여야 되시겠다! 프로젝트할때도 쿼리 튜닝 할테니)

```bash
npm install typeorm @nestjs/typeorm mysql2
```

이렇게 3개 설치해주시면 되겠다.

```ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: '계정',
  password: '비번',
  database: 'nestjs_board_app',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};

export default typeOrmConfig;
```

음 `/src/configs/typeorm.config.ts`에 이렇게 설정을 해주시고..

```ts
...
import typeOrmConfig from './configs/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [BoardsModule, TypeOrmModule.forRoot(typeOrmConfig)],
  controllers: [],
  providers: [],
})
...
```

`/src/app.module.ts`에 import를 시켜주시면 되겠다.

근데 안됨ㅡㅡ 뭐임?

<img width="1060" alt="스크린샷 2023-10-25 오후 8 46 19" src="https://user-images.githubusercontent.com/138586629/277993880-b92b8543-6259-44d4-9b89-9cfa6720a050.png">

<img width="975" alt="스크린샷 2023-10-25 오후 8 46 44" src="https://user-images.githubusercontent.com/138586629/277993890-dcfd6cb5-2b85-466d-b3d6-841d988138dc.png">

<img width="830" alt="스크린샷 2023-10-25 오후 8 46 51" src="https://user-images.githubusercontent.com/138586629/277993892-b6b19935-6183-41c3-952c-4f624dcebb05.png">

온갖 에러를 마주하고 피곤해졌다 ㅋ 학습메모 4 공식문서 보고 다시 도전!

---

아아.. 결론은 ip설정을 잘못 해준거였다.. 우분투 vm ip가 192.168..뭐시기였지

```ts
const typeOrmConfig: TypeOrmModuleOptions = {
  ...
  host: '192.168.64.2',
  ...
};
```

바본가봐 나?

<img width="827" alt="스크린샷 2023-10-25 오후 8 55 31" src="https://user-images.githubusercontent.com/138586629/277996957-123c1e6b-a904-4981-b787-558859653cb8.png">

이제 잘 실행된다.

중간에 안되길래 `driver: 'mysql'`이런것도 넣었는데 이것도 에러 원인이였다.
mysql2 설치했으니 드라이버 설정 안해야 돼더라. `mysql2` 넣어도 안되던데.. 뭐 일단 잘되니까 패스

## Entity 생성하기

ORM 없이 데이터베이스에 테이블을 생성할 땐 `CREATE TABLE...`이렇게 만드는데

TypeORM 사용할 때는 Class를 정의해서 이걸 테이블로 자동 변환해주는거라

Entity라는 Class를 정의해서 등록해주는 거랜다. ㅇㅋㅇㅋ?

- `@Entity()` : 이 클래스가 엔티티다~
- `@PrimaryGeneratedColumn()` : PK 컬럼을 표시
- `@Column` : 컬럼을 표시

이제 만들어보자.

```ts
// /src/boards/board.entity.ts
import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BoardStatus } from './boards.model';

@Entity()
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: BoardStatus.PUBLIC })
  status: BoardStatus;
}
```

/src/boards/board.entity.ts에 만드셈 ㅇㅇ

### 번외

아니 근데 nestJS 프로젝트 만드니까 수정할때마다 eslint인지 prettier인지가 자꾸 에러도 아닌
띄어쓰기 이렇게 해라 큰따옴표대신 작은따옴표 써라 이런 시덥잖은 에러가 떠서 이거 왜 자동수정 안됨?

이러고 있었는데 학습메모 5로 어찌저찌 해결을 했다. `editor default formatter`라는 걸
설정해줘야 됨.

<img width="856" alt="스크린샷 2023-10-25 오후 9 15 50" src="https://user-images.githubusercontent.com/138586629/278002078-c1364175-ab73-48a2-965f-aa2e1bb0f5f2.png">

하여간 위에 있는 걸로 해결되더라. 밑에는 이미 설정했었고.

1. `cmd`+`,` 입력 (환경설정 ㄱ ㄱ)
2. `editor default formatter` 검색
3. `Prettier`로 설정

해주면 이제 알아서 cmd+s 누르면 잘 바꿔줌 ㅇㅇ

## Repository 만들기

1. Repository 파일 만들고
2. 모듈에 등록

```ts
// /src/boards/board.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { Board } from './board.entity';

@EntityRepository(Board)
export class BoardRepository extends Repository<Board> {}
```

엥 근데 보니까 이렇게 Custom Repository를 만드는 `@EntityRepository`가
NestJS에서 deprecated 되었다는거야

<img width="672" alt="스크린샷 2023-10-25 오후 9 34 09" src="https://user-images.githubusercontent.com/138586629/278007997-ee5cbc33-1b50-4ab7-a7b0-488ab3fa9a59.png">

ㅋㅋ이거 뭐 안되는게 절반이다 그쵸? 인터넷 찾아보니 annotator를 또 만들어가지고
이걸 사용하는 방법도 있다는데.. 아까봤던 공식문서 (학습메모 4) 내려보니 ..

그냥 Repository 대신에 Entity를 module에 등록해서 쓰면 되나봄?
대신 뭐 함수 커스텀은 안되겠지만 기본 기능은 뭐 다 될거아냐? 꿍시렁꿍시렁

```ts
// /src/boards/boards.module.ts
...
import { BoardRepository } from './board.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BoardRepository])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
```

원래 강의에서는 이거고

```ts
// /src/boards/boards.module.ts
...
// import { BoardRepository } from './board.repository';
import { Board } from './board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
```

공식문서에서는 이렇게 사용하라고 하네요 ㅇㅇ 아몰라 일단 위에껄로 해놓고 아예 안돌아가면
그때 또 고치는걸로 하자.

## CRUD 구현하기

### 구현을 위해 소스코드 정리할 부분

- BoardsService 부분 전부 주석처리
- BoardsController 부분 전부 주석처리
- Board Model은 이제 필요없음. Entity로 할거거든. (status 부분만 남기자)

### ID를 이용해서 특정 게시물 가져오기

#### BoardRepository 의존성 주입

```ts
// boards.service.ts
@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}
}
```

#### ID로 특정 게시물 가져오기 : findOne() 메소드

Repository 내장으로 존재하는 findOne() 메소드를 이용해주시면 되겠다!

```ts
// boards.service.ts
async getBoardById(id: number): Promise<Board> {
  const found = await this.boardRepository.findOne(id);
  if (!found) {
    throw new NotFoundException(`Can't find Board with id ${id}`);
  }
  return found;
}
```

#### 공식 문서대로 간다

중간에 계속 에러떠서 갑갑해서 그냥 repository custom 없이 공식 지원되는대로 하기로함.

굳이 Repository 없이도 service단에서 필요한거 있으면 다 구현해주면 될듯함. ㅇㅈ?ㅇㅇㅈ
(학습메모 4 계속 참고)

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

이게 예시 CRUD 사용법이고, 앞서도 설명했지만

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

모듈은 이런식으로 구성해주면 된다. UserRepository 대신 User!
자잘하게 다른 부분에 주의하자.

```ts
// boards.service.ts
@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}
  async getBoardById(id: number): Promise<Board> {
    const found = await this.boardRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
    return found;
  }
}
```

하여간 그래서 Service는 이렇게 바뀐다.

```ts
// boards.controller.ts
@Get('/:id')
groupBoardById(@Param('id') id: number): Promise<Board> {
  return this.boardsService.getBoardById(id);
}
```

컨트롤러는 이렇게 바꿔주면됨.

### 게시물 생성하기

이것도 공식문서 참고하면 뚝딱일듯. 강의랑 같은 기능을 바뀐 문법으로 구현해주자. 난 천재니까 후

```ts
// boards.service.ts
async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
  const { title, description } = createBoardDto;

  const board = this.boardRepository.create({
    title,
    description,
    status: BoardStatus.PUBLIC,
  });

  await this.boardRepository.save(board);
  return board;
}
```

```ts
// boards.controller.ts
@Post()
@UsePipes(ValidationPipe)
createBoard(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
  return this.boardsService.createBoard(createBoardDto);
}
```

쉽죠?

<img width="792" alt="스크린샷 2023-10-25 오후 11 52 31" src="https://user-images.githubusercontent.com/138586629/278053688-69f1be74-db01-4786-93a8-251f406dc3c6.png">

<img width="658" alt="스크린샷 2023-10-25 오후 11 56 23" src="https://user-images.githubusercontent.com/138586629/278054900-2db73891-485f-4d4a-8e5e-f97f4c825db7.png">

잘들어가고~

### 게시물 삭제하기

remove()도 있고 delete() 있는데, remove는 없으면 404 에러뜬대
그니까 delete() 쓰래 ㅇㅇ

```ts
// boards.service.ts
async deleteBoardById(id: number): Promise<void> {
  await this.boardRepository.delete({ id });

  Logger.log(`Board with id ${id} deleted`);
}
```

저번에 배운 Logger 써보고~

```ts
// boards.controller.ts
@Delete('/:id')
deleteBoardById(@Param('id', ParseIntPipe) id: number): Promise<void> {
  return this.boardsService.deleteBoardById(id);
}
```

컨트롤러에선 id가 int니까 ParseIntPipe란걸 한번 써보자고?

<img width="862" alt="스크린샷 2023-10-26 오전 12 06 50" src="https://user-images.githubusercontent.com/138586629/278058155-3842c8d8-6600-4332-b3d2-e29256675ad8.png">

지워졌단 로그 정말 잘 뜨고?

<img width="573" alt="스크린샷 2023-10-26 오전 12 07 34" src="https://user-images.githubusercontent.com/138586629/278058331-b0dd1e8c-43e3-42ca-865b-a31691d2a8bd.png">

아주그냥 지워졌죠? 굳

### 게시물 상태 업데이트하기

```ts
// boards.service.ts
async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
  const board = await this.getBoardById(id);
  board.status = status;
  await this.boardRepository.save(board);
  return board;
}
```

```ts
// boards.controller.ts
@Patch('/:id/status')
updateBoardStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body('status', BoardStatusValidationPipe) status: BoardStatus,
): Promise<Board> {
  return this.boardsService.updateBoardStatus(id, status);
}
```

<img width="779" alt="스크린샷 2023-10-26 오전 12 30 58" src="https://user-images.githubusercontent.com/138586629/278065871-793dafb2-a589-4615-8032-5f75f044290f.png">

<img width="653" alt="스크린샷 2023-10-26 오전 12 31 19" src="https://user-images.githubusercontent.com/138586629/278065945-9b2dcd2a-9904-4dad-8147-883d1b5117e0.png">

### 전체 게시물 가져오기

```ts
// boards.service.ts
async getAllBoards(): Promise<Board[]> {
  return this.boardRepository.find();
}
```

```ts
// boards.controller.ts
@Get()
getAllBoards(): Promise<Board[]> {
  return this.boardsService.getAllBoards();
}
```

<img width="794" alt="스크린샷 2023-10-26 오전 12 34 03" src="https://user-images.githubusercontent.com/138586629/278066703-219e4acd-e98a-4584-84a7-95f387c861f1.png">

## 인증

### 인증 기능 구현을 위한 준비

```bash
nest g module auth
nest g controller auth --no-spec
nest g service auth --no-spec
```

<img width="287" alt="스크린샷 2023-11-02 오후 4 20 44" src="https://user-images.githubusercontent.com/138586629/279896940-36b1f6ad-053e-49f3-a158-9179ebd14746.png">

module, controller, service 생성하고

```ts
// /src/auth/user.entity.ts
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```

auth 안에 user.entity.ts도 생성해준다.

다음은 respository

```ts
// /src/auth/user.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
```

이거 deprecated... 됐다고 위에서도 얘기했는데 일단은 이대로 쭉 따라가보자.
대체 왜 없앤거야

```ts
// /src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

이제 모듈에 UserRepository 등록해주고

```ts
// /src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}
}
```

service에 UserRepository 의존성 주입까지.

이러면 준비 끝!

### 회원가입 기능 구현

```ts
// auth/dto/auth-credential.dto.ts
export class AuthCredentialsDto {
  username: string;
  password: string;
}
```

일단 DTO부터 만들고요

```ts
// user.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;
    const user = this.create({ username, password });
    await this.save(user);
  }
}
```

user라는 객체를 생성한다음에 save라는 메소드로 저장을 하는거죠.

```ts
// user.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.createUser(authCredentialsDto);
  }
}
```

<img width="781" alt="스크린샷 2023-11-02 오후 4 47 04" src="https://user-images.githubusercontent.com/138586629/279903054-21e03bf8-a02e-4146-9b3a-34028a0e79b9.png">

<img width="973" alt="스크린샷 2023-11-02 오후 4 46 57" src="https://user-images.githubusercontent.com/138586629/279903016-779c648e-c67f-4eea-b508-ad315af8055f.png">

불안했는데 역시 안되죠?

---

그냥 boards때처럼 repository를 아예 사용하지 말고 그 메소드를 service로 땡겨와봅시다.

```ts
// auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;
    const user = this.userRepository.create({ username, password });
    await this.userRepository.save(user);

    return user;
  }
}
```

이렇게 하는거죠. (참고로 그냥 void 리턴해주는거에서 생성된 user entity 리턴해주는걸로 바꿈 ㅇㅇ boards에서도 그랬던데?)

- UserRepository대신 Repository<User>를 inject하고
- 우리가 만든 custom repository method(userCreate)는 singUp메소드 본문에다 써주고
- 나머지 등록해주는 부분들도 모조리 같이 바꿔줘야됨

그래서 controller, module도 바꿔줘야됨

```ts
// auth.controller.js
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<User> {
    return this.authService.signUp(authCredentialsDto);
  }
}
```

이건 뭐 별 차이없음 리턴값 `Promise<void>`에서 `Promise<User>` 바꾸는거?

```ts
// auth.module.ts

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserRepository } from './user.repository';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

여기서는 기존에 Imports 에서 UserRepository 등록하던걸 User로 바꿔주면됨 굳

<img width="798" alt="스크린샷 2023-11-02 오후 4 53 26" src="https://user-images.githubusercontent.com/138586629/279904591-2927426d-6a34-48da-baa2-1860fd09c76d.png">

<img width="629" alt="스크린샷 2023-11-02 오후 4 53 44" src="https://user-images.githubusercontent.com/138586629/279904647-ad08be2b-5358-41ac-9690-f0aa54a2a206.png">

된다 대박 역시나야

### 유저 데이터 유효성 체크

유저 생성할 때 원하는 이름의 길이, 비밀번호 길이 같은 유효성 체크 ㅇㅇ

`class-validator` 사용할거임 boards때 썼었던 ㅇㅇ

```ts
// auth-credentials.dto.ts

import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  // 영어만 숫자만 가능한 유효성 체크
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  password: string;
}
```

DTO에서 이렇게 등록해주는거임.

ValidationPipe를 무조건 통과시켜줘야 이게 유효성 체크를 실제로 함.

```ts
// auth.controller.ts
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<User> {
    return this.authService.signUp(authCredentialsDto);
  }
}
```

controller에서 `@Body()`안에 이렇게 인자로 넣어주는거임.

<img width="784" alt="스크린샷 2023-11-02 오후 5 12 23" src="https://user-images.githubusercontent.com/138586629/279909134-ab2c48fb-50b5-494f-91c5-fc1db4c29315.png">

<img width="796" alt="스크린샷 2023-11-02 오후 5 13 01" src="https://user-images.githubusercontent.com/138586629/279909290-06f16be1-4dcd-4983-b41c-3fc8288f4ae2.png">

지리죠?

### 유저 이름에 유니크한 값 주기

1. repository의 findOne 메소드로 이미 있으면 에러, 없으면 저장
2. db레벨에서 같은 이름을 가진 유저가 있으면 알아서 에러

2번 방법을 쓸거임. DB의 username 컬럼을 unique 데코레이터에 등록 ㅇㅇ

```ts
// user.entity.ts
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```

<img width="996" alt="스크린샷 2023-11-02 오후 5 46 48" src="https://user-images.githubusercontent.com/138586629/279918502-6d44b1e9-9209-449d-ac33-b167ef424d44.png">

근데 에러가 뜨죠? 이미 jae라는 이름으로 두개를 생성해버려서.. 삭제해주자

<img width="671" alt="스크린샷 2023-11-02 오후 5 47 41" src="https://user-images.githubusercontent.com/138586629/279918735-25d33e52-fb32-4c78-9671-a0edcc024d0e.png">

<img width="843" alt="스크린샷 2023-11-02 오후 5 48 09" src="https://user-images.githubusercontent.com/138586629/279918873-e0734ba7-a8e6-4481-994f-7bf3064120fb.png">

<img width="774" alt="스크린샷 2023-11-02 오후 5 48 43" src="https://user-images.githubusercontent.com/138586629/279919216-36c4329d-7802-44cf-8fcc-3501342d5bdc.png">

<img width="775" alt="스크린샷 2023-11-02 오후 5 48 46" src="https://user-images.githubusercontent.com/138586629/279919057-fe4537d7-75cb-4ec9-892a-263337d1fe6c.png">

굳 (대충 같은 이름으로 두번 생성하니 에러 잘 뜬단 뜻)

<img width="993" alt="스크린샷 2023-11-02 오후 5 49 47" src="https://user-images.githubusercontent.com/138586629/279919344-e41b8735-aa1d-4dc5-86a2-7845b6c41023.png">

근데 이렇게 서버단에서 에러를 띄워버릴 게 아니라 제대로 에러 처리를 해줘야겠죠?
사용자에게도 500에러 말고 400대(브라우저 니가 잘못한거임)를 보내줘야될거고.

```ts
// auth.service.ts
try {
  await this.userRepository.save(user);
} catch (error) {
  console.log(error);
}
```

대략 이렇게 try catch 문으로 로그를 찍어보고 `error code`로 조건문을 넣어주면 된다고 함.

<img width="992" alt="스크린샷 2023-11-02 오후 5 55 29" src="https://user-images.githubusercontent.com/138586629/279920953-8520b346-2d33-4d9a-9c1b-5b41cad1a22e.png">

보니까 강좌에서는 숫자 `23505`가 나왔는데(Postgres) 난 MySQL로 해서 그런지
`ER_DUP_ENTRY`라는 문자열로 된 코드가 나왔음. `error.code`로 접근하면 되겠소.

```ts
// auth.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;
    const user = this.userRepository.create({ username, password });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        Logger.error(`[Auth] Username ${username} already exists`);
        throw new ConflictException(`Username ${username} already exists`);
      } else {
        Logger.error(
          `[Auth] Internal Server Error while saving user ${username}`,
        );
        throw new InternalServerErrorException();
      }
    }

    return user;
  }
}
```

멋지죠? 이렇게 겹치면 `ConflictException`이라는 걸 주면 되고,
그거 아니면 (기존대로) `InternalServerErrorException`이라는 걸 주면 됨.

<img width="778" alt="스크린샷 2023-11-02 오후 6 01 55" src="https://user-images.githubusercontent.com/138586629/279922633-98f44a24-c44b-4382-834d-cb01c6bc7a92.png">

잘 됨

<img width="841" alt="스크린샷 2023-11-02 오후 6 02 06" src="https://user-images.githubusercontent.com/138586629/279922683-7160b93b-4815-427a-a1b5-4d2ad938feac.png">

에러 로그도 잘 남음

### 비밀번호 암호화 하기 (설명)

bcrypt라는 모듈을 사용해서 비밀번호를 암호화해보겠음.

```bash
npm i bcryptjs
```

```ts
import bcrypt from 'bcryptjs';
```

요렇게 설치해서 써주면 되시겠다. 강의에선 `import * as bcrypt` 형식으로 쓰는데 우리가 프로젝트때 쓸 airbnb 코딩컨벤션에 위배되므로 미리 저렇게 써보는 연습을 ㄱ ㄱ

#### 비밀번호를 암호화해서 저장하는 방법

1. 평문으로 저장 (최악)
2. key를 통해 복호화 가능한 암호 알고리즘 사용 (양방향, 별로임)
3. sha256등 hash를 사용해서 암호화 (단방향, 굳)
4. `salt + password`를 hash로 암호화해서 저장

뭐 다 아는 내용이죠? hash써야지 ㅇㅇ salt도 쓰죠 ㅇㅇ

### 비밀번호 암호화 하기 (소스 코드 구현)

이제 구현하자 구현

`bcrypt.genSalt()`로 salt 생성 가능
`bcrypt.hash(password, salt)`로 hash 가능

```ts
// auth.service.ts

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        Logger.error(`[Auth] Username ${username} already exists`);
        throw new ConflictException(`Username ${username} already exists`);
      } else {
        Logger.error(
          `[Auth] Internal Server Error while saving user ${username}`,
        );
        throw new InternalServerErrorException();
      }
    }

    return user;
  }
}
```

<img width="984" alt="스크린샷 2023-11-02 오후 6 21 05" src="https://user-images.githubusercontent.com/138586629/279928421-44bf210f-0aaf-4b65-af6a-d383d600db03.png">

는 `import bcrypt`, `import bcryptjs` 다 안되네요 ^^ 걍 `* as` 씁시다.

```ts
import * as bcrypt from 'bcryptjs';
```

참고로 그냥 bcrypt도 있다함 ㅇㅇ 성능은 이게 c++이라 더 좋은데 브라우저에서 못쓴다나 뭐라나 근데 서번데 뭐 상관있나? 담엔 bcrypt 써보던지 하자.

<img width="777" alt="스크린샷 2023-11-02 오후 6 23 24" src="https://user-images.githubusercontent.com/138586629/279929074-383abf53-4d1f-489a-8c47-bb0f7502c5a1.png">

해시 잘 생성됩니다. 근데 Salt도 따로 저장을 해줘야할텐데? 강의엔 왜 없는겨

```ts
// user.entity.ts
...
@Entity()
@Unique(['username'])
export class User extends BaseEntity {
 ...

  @Column()
  salt: string;
}
```

뭐 그냥 넣어주자.

```ts
// auth.service.ts
const user = this.userRepository.create({
  username,
  password: hashedPassword,
  salt,
});
```

생성할 때 salt도 넣어주고~

<img width="793" alt="스크린샷 2023-11-02 오후 6 25 54" src="https://user-images.githubusercontent.com/138586629/279929773-327479a8-bdeb-4054-9e07-088d20bebc7f.png">

<img width="651" alt="스크린샷 2023-11-02 오후 6 26 18" src="https://user-images.githubusercontent.com/138586629/279929914-875ad8cf-e283-4154-8e5f-4b02f8e2cd02.png">

아이죠앙

### 로그인 기능 구현하기

signIn()함수를 만들어 줄건 데 요 !

repository.findOne() 써서 뭐시기저시기 해주면 됨 ㅇㅇ
=> 강의에선 그런데 나는 {}로 특정 속성(username)만으로 검색할거라 `findOneBy()`

```ts
// auth.service.ts

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  ...
  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.userRepository.findOneBy({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      return 'login successful';
    } else {
      throw new UnauthorizedException('login failed');
    }
  }
}
```

```ts
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  ...
  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    return this.authService.signIn(authCredentialsDto);
  }
}
```

<img width="803" alt="스크린샷 2023-11-02 오후 6 51 43" src="https://user-images.githubusercontent.com/138586629/279937307-fed4b79b-f9fa-4723-b36d-27e189625100.png">

<img width="792" alt="스크린샷 2023-11-02 오후 6 51 50" src="https://user-images.githubusercontent.com/138586629/279937311-de40b9d5-898f-4e3d-af9f-ff0e0e8b7ccb.png">

아니 이게 무슨일이야 난 어디에도 salt를 넣지 않았는데...????
`bcrypt.compare()` 함수에서 대체 무슨일이 일어나고 있는거지????? 이게 왜 됨?

#### bcrypt.compare()에 대한 의문

학습메모 6, 7. 특히 7에서 비슷한 의문을 가졌던 사람들이 설명을 잘 해준다.

<img width="506" alt="스크린샷 2023-11-02 오후 7 03 46" src="https://user-images.githubusercontent.com/138586629/279940471-2568f91f-159a-4ff4-962c-108cd777f33e.png">

우선 확실한 사실은 bcrypt에서 **salt+password와 합쳐서 해시되는 건 맞고, 다만 그 hash값 앞에 salt값이 그냥 붙어있는 것.**

이게 보통은 salt를 따로 저장해둬야 한다고 배우기 때문에 살짝 혼란스러웠는데

1. 결국 salt+password로 hash하는 사실엔 변함이 없음
2. salt값이 그냥 노출되는 것 같지만 사실 원래 salt column 하나 더 만들어서 저장하는거나 password(hashed password) column에 같이 저장하는거나 매한가지임.

그래서 그냥 `bcrypt.hash()`의 return값이 `salt + hash(salt+password)`다 이렇게 이해하면 됨. 보안적으로 **salt column을 따로 두는 것과 아무 차이가 없음.**

고민 해결! (salt column은 다시 지워주자)

### JWT에 대해서

JWT는 뭐 Json Web Token이고, Header, Payload, Verify Signature로 구성되어 있고 등등~

- Header : 토근에 대한 메타 데이터 포함. 타입, 해싱 알고리즘(SHA256, RSA, ...)
- Payload : 유저 정보(issuer), 만료 기간(expiration time), 주제(subject), ...
- Verify Signature : 위변조 방지. HMACSHA256(헤더, 페이로드, secret)

### JWT를 이용해서 토큰 생성하기

필요한 모듈들 설치

- @nestjs/jwt
- @nestjs/passport
- passport
- passport-jwt

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt
```

다음으론 auth 모듈에 imports로 JWT모듈 넣어주자.

```ts
...
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/configs/jwt.config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

```ts
import { JwtModuleOptions } from '@nestjs/jwt';

const jwtConfig: JwtModuleOptions = {
  secret: 비밀임^^,
  signOptions: {
    expiresIn: 3600,
  },
};

export { jwtConfig };
```

config는 따로 빼서 .gitignore 처리해줬다.

service에서도 jwtService를 등록해서 사용하게 해줘야 함.
그 뒤에 signIn() 함수에서 `return 'login Success'` 대신에 유저 토큰을 생성해줘야지.

```ts
// auth.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  ...

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.userRepository.findOneBy({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // 유저 토큰 생성 (Secret + Payload)
      const payload = { username };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('login failed');
    }
  }
}
```

```ts
// auth.controller.ts
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  ...
  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }
}
```

컨트롤러에서는 리턴타입만 바꿔주면 됨 ㅇㅇ `{ accessToken: string }`

<img width="798" alt="스크린샷 2023-11-02 오후 11 08 09" src="https://user-images.githubusercontent.com/138586629/280015957-6bbf9de9-78b4-413a-b8ed-fab71011515a.png">

잘 나오고요

<img width="1296" alt="스크린샷 2023-11-02 오후 11 09 09" src="https://user-images.githubusercontent.com/138586629/280016280-58b94200-63b5-4d80-8f00-0fcd2fc0544d.png">

payload에 username도 잘 들어가있죠? 굳 성공

### Passport, JWT 이용해서 토큰 인증 후 유저 정보 가져오기

<img width="938" alt="스크린샷 2023-11-02 오후 11 10 16" src="https://user-images.githubusercontent.com/138586629/280016636-74d2e7e4-b6c2-4a12-919e-332d8722b105.png">

뭐 하여튼 실제로는 걍 Json으로 보내는게 아니라 cookie에 넣어줘야죠?
그리고 인증할때 HTTP Header 중 Auth..로 하는데 `Bearer` 토큰을 이용하겠대!

이런것들을 다 작성해줄거임

하여튼 이 그림에서 5, 6번을 이번에 구현할거임

먼저 추가로 필요한 모듈

- @types/passport-jwt

```bash
npm i @types/passport-jwt
```

그 후 /src/auth/jwt.strategy.ts 생성해줘야함. 여기다 앞서말한 정보들을 넣어줘야함.

```ts
// /src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { jwtConfig } from 'src/configs/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { username: string }): Promise<User> {
    const { username } = payload;
    const user: User = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

이거 어려우니까 여러 번 보고 눈에 익히자. (강의랑 조금 다름 repository랑 scret 등)

그리고 이제 boards 등 다른 모듈에서도 jwt 기능을 사용하기 위해서 module에서 exports에 등록해줘야 함.
(인가, Authorization을 위해 사용하는 거겠지용? 로그인 해야 글 볼 수 있다 등등)

```ts
// auth.module.ts
...
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(jwtConfig),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

대충 뭔말인지 아시겠죠?

이제 auth 기능 잘 동작하는지 테스트를 한 번 해보죠

```ts
// auth.controller.ts

@Post('/test')
test(@Req() req) {
  console.log(req);
} // test
```

auth controller에 `POST /auth/test` 등록.

<img width="1074" alt="스크린샷 2023-11-02 오후 11 36 15" src="https://user-images.githubusercontent.com/138586629/280024722-06ffdfeb-592d-45ba-adcf-10d14824ad84.png">

Postman의 Authorization 기능을 이용해서 Bearer Token에 아까 생성한 AccessToken을 넣어보는거임 ㅇㅇ

<img width="998" alt="스크린샷 2023-11-02 오후 11 35 50" src="https://user-images.githubusercontent.com/138586629/280024592-086bf1d4-bfa0-4ff0-afc2-5e2d5300c08b.png">

엄청나게 많은 정보가 쏟아져 나오는데 아무튼 authorization에 Bearer랑 토큰이 잘 들어가서 서버로 전송은 되지요? 일단 아래로 넘어가봐 할 거 더있음.

#### UseGuards

강의 설명이 갑자기 이상해졌는데, 결국에 우리가 **어떤 기능에 대해 인증 후에 사용**하도록
하고싶으면 `미들웨어단에 아까 만든 validate() 메소드를 통과`시켜줘야 하잖아?

그러려고 그 위에서 헤더에 Bearer Token을 넣어줬는데 그 토큰을 미들웨어 단에서
토큰 인증 후 인증 통과하면 user객체를 반환해서 해당 사용자 정보까지 얻을 수 있도록 해야겠죠?

지금 POST /auth/test에는 요청 값에 당연히 user객체가 없죠?

이걸 확인하고 반환값(user객체)까지 전달해주는 미들웨어를 `Guards` 미들웨어로 구현 가능

하여튼 `@UserGuards(AuthGuard())`라는 걸 넣으면 그게 가능

<img width="602" alt="스크린샷 2023-11-02 오후 11 39 41" src="https://user-images.githubusercontent.com/138586629/280025875-a7158098-5250-48f6-9e87-57b724c344d4.png">

`Guards`는 미들웨어 중에 하나인데

<img width="744" alt="스크린샷 2023-11-02 오후 11 40 51" src="https://user-images.githubusercontent.com/138586629/280026214-d5727bbe-f0ae-4358-95fc-a3b08e36a003.png">

<img width="737" alt="스크린샷 2023-11-02 오후 11 41 14" src="https://user-images.githubusercontent.com/138586629/280026359-0fa023b3-78c8-456a-a5c8-4c002b1bf19b.png">

하여튼간에 지정된 경로로 통과할 수 있는 사람과 허용되지 않은 사람을 서버에게 알려주는 역할을 한대. 그 로그인 인증 말하는 거 아니고 토큰 인증 후 인가하는거 말하는거임 ㅇㅇ

말을 어렵게 해서 그렇지 결국 `Guards: 인가(Authorization) 미들웨어`라고 보면될듯

<img width="693" alt="스크린샷 2023-11-02 오후 11 48 29" src="https://user-images.githubusercontent.com/138586629/280028677-dab320b5-a6fb-42c8-af56-0a621100aa3a.png">

순서 참고. 별로 지금 알 필요는 없을듯

```ts
// auth.controller.ts
@Post('/test')
@UseGuards(AuthGuard())
test(@Req() req) {
  console.log(req);
  return req.user;
} // test
```

하여튼 어쨋든 그냥 `@UseGuards(AuthGuard())`해주면 됨.
알아서 인증도 해주고 안되면 401 에러까지 띄워줌

user 제대로 받아지는지 보려고 req.user를 리턴도 시켜보갓스~

<img width="1112" alt="스크린샷 2023-11-02 오후 11 52 47" src="https://user-images.githubusercontent.com/138586629/280030543-6d2cb39b-cbb0-413e-b593-e73120ebf783.png">

응 잘되쥬 어머나 비번까지 와버리네..

<img width="1101" alt="스크린샷 2023-11-02 오후 11 50 43" src="https://user-images.githubusercontent.com/138586629/280029786-2b0c1532-bf67-4ca6-ab2f-bfc7e714e930.png">

하여튼 잘못된 값 넣으면 이렇게 401 에러 뜸

### 커스텀 데코레이터 생성하기

아까 그래서 `req.user`해서 user를 가져왔는데, 바로 user 가져오게 해볼게.

`createParamDecorator()`라는걸 이용하면 된답니다.

`ctx.switchToHttp().getRequest()` 하면 아까 로그에 쭉 쌓였던 nest의 request 객체(HTTP Request 파싱한거)를 가져오는거임.

```ts
// /src/auth/get-user.decorator.ts
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from './user.entity';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
```

뭐 요렇게 데코레이터 정의를 해주고요.

```ts
// auth.controller.ts
@Post('/test')
@UseGuards(AuthGuard())
test(@GetUser() user: User) {
  console.log(user);

  return { id: user.id, username: user.username };
}
```

대강 이렇게 해주면 되겠습니다. password 찝찝해서 뺐습니다.

<img width="1090" alt="스크린샷 2023-11-03 오전 12 03 52" src="https://user-images.githubusercontent.com/138586629/280035249-8e7bae56-bd2e-4ae0-9dde-c208b68b2c5a.png">

네 잘 되네요

<img width="556" alt="스크린샷 2023-11-03 오전 12 04 21" src="https://user-images.githubusercontent.com/138586629/280035375-936e1d05-7876-4072-aeaa-e87378837d24.png">

로그정돈 남길 수 있잖아요 알겠어요 지울게요

### 인증된 유저만 게시물 보고 쓸 수 있게 해주기

이제 드디어 아까 테스트한 Guards 미들웨어를 실제로 boards에서 로그인이 되어있는 상태여야 글 조회가 가능하도록 등록하는 것을 가능하도록 해보죠!

```ts
// boards.module.ts
...
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
```

간만에 찾아뵙게된 boards.module.ts. AuthModule을 imports로 등록!

```ts
// boards.controller.ts

import {
  ...
  UseGuards,
} from '@nestjs/common';
...
import { AuthGuard } from '@nestjs/passport';

@Controller('boards')
@UseGuards(AuthGuard())
export class BoardsController {
  ...
}
```

이렇게 Controller 단에서 전체에 넣어버릴 수도 있다.

그러면은 이제 뭘 해도 안되겠죠 인증없으면?

<img width="1104" alt="스크린샷 2023-11-03 오전 12 13 08" src="https://user-images.githubusercontent.com/138586629/280038292-895448fd-07ca-41ff-9556-581f1fc9e514.png">

토큰 없으면 안되고

<img width="1088" alt="스크린샷 2023-11-03 오전 12 13 18" src="https://user-images.githubusercontent.com/138586629/280038336-fc23a8f5-a228-4516-a044-d06e9d80c34a.png">

토큰 있으면 되고 ㅇㅈ?ㅇㅇㅈ

## 게시물에 접근하는 권한 처리

### 유저와 게시물의 관계 형성 해주기

유저(User) 테이블과 게시물(Board) 테이블 간의 관계(Relationship)을 형성을 형성하려면 엔티티에 서로 간의 필드를 넣어줘야 함.

User-Board 관계는 User입장에선 OneToMany, Board입장에선 ManyToOne 관계임.

entity에 이 데코레이터를 써주면 됩니다.

```ts
// user.entity.ts
...
@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  ...
  @OneToMany(() => Board, (board) => board.user, { eager: true })
  boards: Board[];
}
```

```ts
// board.entity.ts
@Entity()
export class Board extends BaseEntity {
  ...
  @ManyToOne(() => User, (user) => user.boards, { eager: false })
  user: User;
}
```

뭐 이렇게 하는거래 너무 물어보지는 마세요.. 약속이잖아요

### 게시물을 생성할 때 유저 정보 넣어주기

board.service.ts의 createBoard에 추가해주죠.

```ts
// board.controller.ts
@Post()
@UsePipes(ValidationPipe)
createBoard(
  @Body() createBoardDto: CreateBoardDto,
  @GetUser() user: User,
): Promise<Board> {
  return this.boardsService.createBoard(createBoardDto, user);
}
```

```ts
// board.service.ts
async createBoard(
  createBoardDto: CreateBoardDto,
  user: User,
): Promise<Board> {
  const { title, description } = createBoardDto;

  const board = this.boardRepository.create({
    title,
    description,
    status: BoardStatus.PUBLIC,
    user,
  });

  await this.boardRepository.save(board);
  return board;
}
```

이렇게 createBoard 컨트롤러단이랑 서비스단에서 인자에 user 추가해주면 땡!
앞서 만든 @GetUser()도 이용해줬죠?

<img width="1124" alt="스크린샷 2023-11-03 오후 1 29 33" src="https://user-images.githubusercontent.com/138586629/280185902-031613d4-a49f-4ac5-b49b-3a32703c56a0.png">

로그인 해서 토큰 받은후에

<img width="1116" alt="스크린샷 2023-11-03 오후 1 30 42" src="https://user-images.githubusercontent.com/138586629/280185910-62a9b549-f0be-41fe-9dc5-e27e1afd2e6c.png">

POST /boards Bearer Token이랑 게시글 정보 넣어서 요청해보면
DB에 user값까지 같이 잘 들어가는 것을 확인할 수 있다!

### 해당 유저의 게시물만 가져오기

내가 쓴 글 보기 기능 추가해보자고!

<img width="1079" alt="스크린샷 2023-11-03 오후 1 48 53" src="https://user-images.githubusercontent.com/138586629/280187797-db550e65-72d2-4a6c-87bb-eaa774553427.png">

<img width="1109" alt="스크린샷 2023-11-03 오후 1 49 04" src="https://user-images.githubusercontent.com/138586629/280187801-72abdeb2-17fb-4876-be91-4aec27c51d7c.png">

<img width="1105" alt="스크린샷 2023-11-03 오후 1 49 24" src="https://user-images.githubusercontent.com/138586629/280187803-b02a2fed-0fef-43c0-9ff5-871128b7bf76.png">

user1, user2를 signup으로 생성해서 signin으로 로그인, post boards로 글쓰기를 순차적으로 진행해줬다. 글은 2~3개씩 생성해봄.

`createQueryBuilder`라는것을 이용해 볼텐데요.

강의에선 getAllBoard()를 바꿔서 했는데 우리는 getBoardsByUser 이런식으로 새로 만들어보죠?

```ts
// boards.controller.ts
@Get('/me')
getAllBoardsByUser(@GetUser() user: User): Promise<Board[]> {
  return this.boardsService.getAllBoardsByUser(user);
}
```

`GET /boards/me`에 등록

```ts
// boards.service.ts
async getAllBoardsByUser(user: User): Promise<Board[]> {
  const query = this.boardRepository.createQueryBuilder('board');

  query.where('board.userId = :userId', { userId: user.id });

  const boards = await query.getMany();

  return boards;
}
```

<img width="1096" alt="스크린샷 2023-11-03 오후 2 00 24" src="https://user-images.githubusercontent.com/138586629/280188867-62250eca-b358-484e-92e1-e9dc5c652d76.png">

아이고 이러니까 이미 등록해둔 `GET /boards/:id`에 먼저 걸려버림

<img width="511" alt="스크린샷 2023-11-03 오후 2 01 03" src="https://user-images.githubusercontent.com/138586629/280188937-1c2b409e-83b2-43ba-b93c-23021b80ef15.png">

컨트롤러에서 `GET /boards/:id` 위로 올려줘버리자. 순서대로니까

<img width="1091" alt="스크린샷 2023-11-03 오후 2 02 05" src="https://user-images.githubusercontent.com/138586629/280189064-71da3ec9-73cc-4d3f-be56-e8a679c3ca7a.png">

<img width="1091" alt="스크린샷 2023-11-03 오후 2 02 36" src="https://user-images.githubusercontent.com/138586629/280189105-855bc6ec-9c98-4046-a9bb-8f389eca546e.png">

이제 `/boards/me`, `/boards/:id` 다 문제없이 작동한다. id가 me일리는 없다 ㅇㅈ?

### 자신이 생성한 게시물을 삭제하기

이제 delete할 때 자기 게시물이여야 삭제할 수 있게 하죠? ㅇㅋㅇㅋ

```ts
// board.controller.ts
@Delete('/:id')
deleteBoardById(
  @Param('id', ParseIntPipe) id: number,
  @GetUser() user: User,
): Promise<void> {
  return this.boardsService.deleteBoardById(id, user);
}
```

컨트롤러엔 @GetUser만 추가해주고, 서비스메소드 파라미터에 user 추가해주고,,,

```ts
// board.service.ts
async deleteBoardById(id: number, user: User): Promise<void> {
  const result = await this.boardRepository.delete({ id, user });

  if (result.affected === 0) {
    throw new NotFoundException(`Can't find Board with id ${id}`);
  }

  Logger.log(`[Boards] Board with id ${id} deleted`);
}
```

서비스에선 이렇게.. delete조건에 user 추가만 해주면 된다고.. 했거든..?

<img width="1012" alt="스크린샷 2023-11-03 오후 2 14 11" src="https://user-images.githubusercontent.com/138586629/280190310-62b79101-14bb-4d30-b127-b91835499911.png">

아 왜 안되는데...

<img width="568" alt="스크린샷 2023-11-03 오후 2 22 38" src="https://user-images.githubusercontent.com/138586629/280191214-d9e98c74-cd01-44d2-8886-c35338b28c4b.png">

삽질 좀 하다가 그룹 동료분이 정리해놓으신 자료를 참고해서 해결했다.
저렇게 넣으면 user.id만으로 검색이 가능하구나..

다시 보니 에러도 저 user안에 또 Boards[]가 있어서 에러난거라
아무튼 저렇게 선별적으로만 넣어주면 문제없는 것 같다.

왜냐면 잘됐거든 ㅋ 봐봐

<img width="1089" alt="스크린샷 2023-11-03 오후 2 24 50" src="https://user-images.githubusercontent.com/138586629/280191607-cb52764e-3cd7-4db6-a7a4-66a1a6b9174d.png">

15번 게시글 없애줄거임 user2에서 생성한거임 이거, 토큰도 user2꺼

<img width="1109" alt="스크린샷 2023-11-03 오후 2 25 08" src="https://user-images.githubusercontent.com/138586629/280191609-d5f6ea9a-de11-40d6-bab4-7be129fc157c.png">

<img width="965" alt="스크린샷 2023-11-03 오후 2 25 14" src="https://user-images.githubusercontent.com/138586629/280191611-5df65b7f-8e33-4a74-9e7e-847f3a493761.png">

ㅇㅇ됨

<img width="1101" alt="스크린샷 2023-11-03 오후 2 25 28" src="https://user-images.githubusercontent.com/138586629/280191613-e396aea4-7f7f-443e-bf71-8c99e6e7028a.png">

됨됨

<img width="1082" alt="스크린샷 2023-11-03 오후 2 29 07" src="https://user-images.githubusercontent.com/138586629/280191947-da36b182-ebdb-4fcf-a825-f019679c4c82.png">

<img width="1097" alt="스크린샷 2023-11-03 오후 2 28 59" src="https://user-images.githubusercontent.com/138586629/280191952-8f30c55a-3f3b-40ea-b865-273317568d89.png">

이게 NotFound 뜰 일인가 싶긴하지만 아무튼 다른 계정이 생성한 게시글은 삭제 안됨. 굳

## 로그 남기기

### 로그에 대해서

이제 로그에 대해서 알아볼건디요.

#### 로그의 종류

- Log : 중요한 정보의 범용 로깅
- Warning : 치명적이거나 파괴적이지 않은 처리되지 않은 문제
- Error : 치명적이거나 파괴적인 처리되지 않은 문제
- Debug : 오류 발생시 로직 디버그용 로그 (개발자용)
- Verbose : TMI까지 다출력하는, App 동작 전반에 관한 로그 (운영자용)

#### 로그 레벨 (예시)

- Development : Log, Error, Warning, Debug, Verbose
- Staging : Log, Error, Warning
- Production : Log, Error

#### 구현 고고

보통 express는 winston(우리도 마이썼죠) 모듈을 주로 쓰는데
nest에는 빌트인 Logger 클래스가 있어서 이걸 사용(혼자 찾아서 계속 썼었긴함ㅎ)

원래 로그는 개발단계에서 계속 찍어주는게 맞음 ㅇㅇ

```ts
// main.ts
...
import { Logger } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  Logger.log(`[App] Application listening on port 3000`);
}
bootstrap();
```

이건 뭐 main.ts에서 로그 찍는 예시. 우리 뭐 양식도 잘 통일했었잖아.
copilot이 알아서 다 해줄거임 탭만 치셈 (나머지 로깅은 생략 커밋보센)

근데 클래스 안에 Logger 객체를 생성해서 남기면 어디서 로그 내보내는지 표시도 할 수 있거든? 이 기능도 보여줄게 boards에서

```ts
// boards.controller.ts
...
@Controller('boards')
@UseGuards(AuthGuard())
export class BoardsController {
  private logger = new Logger('BoardsController');
  constructor(private boardsService: BoardsService) {}

  @Get('/me')
  getAllBoardsByUser(@GetUser() user: User): Promise<Board[]> {
    this.logger.verbose(`User ${user.username} retrieving all boards`);
    return this.boardsService.getAllBoardsByUser(user);
  }
  ...
  @Get()
  getAllBoards(): Promise<Board[]> {
    this.logger.verbose('Retrieving all boards');
    return this.boardsService.getAllBoards();
  }
}
```

<img width="758" alt="스크린샷 2023-11-03 오후 2 40 44" src="https://user-images.githubusercontent.com/138586629/280193218-46f31dbd-99af-48d5-beae-e89535cca5d5.png">

이쁘게 잘 남쥬? 로그 생성 위치 정보가 노란색으로 이쁘게 표시되니 잘 활용하도록 ㅇ ㅇ ㅇ

```ts
// boards.controller.ts
@Post()
@UsePipes(ValidationPipe)
createBoard(
  @Body() createBoardDto: CreateBoardDto,
  @GetUser() user: User,
): Promise<Board> {
  this.logger.verbose(
    `User ${user.username} creating a new board. Payload: ${JSON.stringify(
      createBoardDto,
    )}`,
  );
  return this.boardsService.createBoard(createBoardDto, user);
}
```

객체는 JSON Stringify로 감싸줘야지 안그러면 [Object object]로 내용이 감추어져버림

<img width="919" alt="스크린샷 2023-11-03 오후 2 45 59" src="https://user-images.githubusercontent.com/138586629/280193761-676f4824-a244-449d-b390-954688a547cb.png">

before

<img width="1001" alt="스크린샷 2023-11-03 오후 2 44 03" src="https://user-images.githubusercontent.com/138586629/280193538-912c81b2-103c-459e-bee5-e2cbf6f96cd3.png">

after

## 설정 및 마무리

### 설정(Configuration) 및 적용

이미 다 해버렸지만, 비밀번호 secret API key 이런거 따로 파일로 분리해서 gitignore로 숨겨줘야 한다 이말하는거임.

설정엔 두가지가 있는데

- Codebase : Port같이 노출돼도 상관 없는 정보
- Environment Variables(환경 변수) : 비밀번호, API key 같은 숨겨야할 정보

모듈은 윈도우에선 기본적으로 환경변수 지원안해줘서 win-node-env 설치,
윈/맥 상관없이 config모듈도 설치

```bash
npm i config
```

우리는 이것만 할게욤

YML이나 JSON 하면 되는데 YML 해보죠

- default.yml
- development.yml
- product.yml

default는 default고,
개발 단계랑 배포 단계에서 다르게 설정하려면 dev, product에다 설정해주면 됨.

<img width="303" alt="스크린샷 2023-11-03 오후 2 58 40" src="https://user-images.githubusercontent.com/138586629/280195231-cc999c83-cb2b-4f8e-a06c-86e7f62c84d2.png">

```yml
# /config/default.yml
server:
  port: 3000

db:
  type: mysql
  port: 3306
  database: nestjs_board_app

jwt:
  expiresIn: 3600
```

```yml
# development.yml
db:
  host: 192.168.64.2
  username: ubuntu
  password: 비밀임^^1
  synchronize: true

jwt:
  secret: 비밀임^^2
```

```yml
# production.yml
db:
  synchronize: false

jwt:
  secret: 비밀임^^3
```

뭐 이런식임 ㅇㅇ 다 넣지는 않을게

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig = config.get('server');
  await app.listen(serverConfig.port);
  Logger.log(`[App] Application listening on port ${serverConfig.port}`);
}
bootstrap();
```

불러올때는 걍 이런식으로 해주면 됨. 기존에 하던 방식이랑 크게 다를 게 없는데?

뭐 그리고 `process.env.RDS_HOSTNAME` 이런거를 설정해주면 아마존 AWS에서 환경변수로 가져온 값을 사용하게 할 수 있다네요?

그래서 `process.env.RDS_HOSTNAME || dbConfig.host` 이런식으로
설정해주면 있을 때는 환경변수 쓰고, 환경변수 없을 때는 config 파일 뒤져서
쓰고 이런식으로 설정이 되는거임 ㅇㅋ?

```ts
// typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig = config.get('db');

const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME || dbConfig.host,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME || dbConfig.username,
  password: process.env.RDS_PASSWORD || dbConfig.password,
  database: process.env.RDS_DB_NAME || dbConfig.database,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: dbConfig.synchronize,
};

export { typeOrmConfig };
```

바로 이런식으로! Config 파일을 수정하는거지 아주 깔끔하네

### 마무리 + AWS 배포 관련

뭐 그래서

- Boards, Auth 모듈/컨트롤러/서비스
- Board, User 엔티티/DTO/리파지토리
- 파이프(Class-Validator), Guards(AuthGuard) 등 미들웨어
- 로깅, config, ...

이런거 배움 ㅇ ㅇ

배포에 대해서도 강의자료가 있는데 학습메모 8 참고.

drawio로 확장자 변경해서 VSCode에서 실행하셈

<img width="839" alt="스크린샷 2023-11-03 오후 4 08 21" src="https://user-images.githubusercontent.c
om/138586629/280210619-3a310abe-70a1-4a56-bcff-345889ac89a0.png">

<img width="677" alt="스크린샷 2023-11-03 오후 4 08 56" src="https://user-images.githubusercontent.com/138586629/280210642-f5f83c6b-9193-4164-ba74-d1eefa2ac65c.png">

<img width="705" alt="스크린샷 2023-11-03 오후 4 09 31" src="https://user-images.githubusercontent.com/138586629/280210718-67f58ea5-30d4-4b4f-ae75-f1071480c87b.png">

<img width="718" alt="스크린샷 2023-11-03 오후 4 09 28" src="https://user-images.githubusercontent.com/138586629/280210729-75e22aa9-e163-403c-bbdc-fedba3521f75.png">

대충 AWS로 프론트, 백 프로젝트 배포하기 위한 좋은 지침들이 들어있단 말씀! 끝!

## 학습메모

1. [따라하면서 배우는 NestJS](https://www.youtube.com/watch?v=3JminDpCJNE&t=1677s)
2. [class-validator 사용법](https://github.com/typestack/class-validator#manual-validation)
3. [nestJS 환경에서 log 찍기](https://stackoverflow.com/questions/59741255/how-can-i-see-console-log-output-when-running-a-nestjs-app)
4. [nestJS 공식문서: TypeORM + MySQL](https://docs.nestjs.com/techniques/database)
5. [vscode eslint prettier 자동수정 적용 안될 때](https://kir93.tistory.com/entry/VSCode-ESLint-Prettier-%EC%9E%90%EB%8F%99-%EC%88%98%EC%A0%95-%EC%A0%81%EC%9A%A9%EC%95%88%EB%90%A0-%EB%95%8C#google_vignette)
6. [bcrypt.compare()에 hash를 안넣어도 왜 될까](https://www.inflearn.com/questions/402769/salt-%EC%9D%B4%EC%9A%A9%ED%95%98%EC%97%AC-%ED%8C%A8%EC%8A%A4%EC%9B%8C%EB%93%9C-%EC%83%9D%EC%84%B1%ED%9B%84-%EB%82%98%EC%A4%91%EC%97%90-%ED%8C%A8%EC%8A%A4%EC%9B%8C%EB%93%9C-%EB%B9%84%EA%B5%90%ED%95%A0%EB%95%8C-salt%EA%B0%92%EC%9D%B4-%ED%95%84%EC%9A%94%ED%95%98%EC%A7%80-%EC%95%8A%EB%82%98%EC%9A%94)
7. [bcrypt.compare()에 hash를 안넣어도 왜 될까2](https://stackoverflow.com/questions/13023361/how-does-node-bcrypt-js-compare-hashed-and-plaintext-passwords-without-the-salt)
8. [NestJS 배포 강의자료(drawio로 확장자 변경해서 VSCode에서 실행하셈)](https://drive.google.com/file/d/1z3QUaECsZ_bVHIUF-rYyDrNv_oCvR8re/view)
