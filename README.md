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

### 비밀번호 암호화 하기 (설명)

### 비밀번호 암호화 하기 (소스 코드 구현)

### 로그인 기능 구현하기

### JWT에 대해서

### JWT를 이용해서 토큰 생성하기

### Passport, JWT 이용해서 토큰 인증 후 유저 정보 가져오기

### 커스텀 데코레이터 생성하기

### 인증된 유저만 게시물 보고 쓸 수 있게 해주기

## 게시물에 접근하는 권한 처리

### 유저와 게시물의 관계 형성 해주기

### 게시물을 생성할 때 유저 정보 넣어주기

### 해당 유저의 게시물만 가져오기

### 자신이 생성한 게시물을 삭제하기

## 로그 남기기

### 로그에 대해서

## 설정 및 마무리

### 설정(Configuration) 이란?

### 설정 적용 & 강의 마무리

## 학습메모

1. [따라하면서 배우는 NestJS](https://www.youtube.com/watch?v=3JminDpCJNE&t=1677s)
2. [class-validator 사용법](https://github.com/typestack/class-validator#manual-validation)
3. [nestJS 환경에서 log 찍기](https://stackoverflow.com/questions/59741255/how-can-i-see-console-log-output-when-running-a-nestjs-app)
4. [nestJS 공식문서: TypeORM + MySQL](https://docs.nestjs.com/techniques/database)
5. [vscode eslint prettier 자동수정 적용 안될 때]()
