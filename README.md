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

### 새로운 서비스 메소드 추가해보기

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

## 학습메모

1. [따라하면서 배우는 NestJS](https://www.youtube.com/watch?v=3JminDpCJNE&t=1677s)
