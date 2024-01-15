## 환경변수

`.env` 파일 생성 후 아래 내용 입력

```
SERVER_PORT= 서버 포트번호 (default: 3000)

DB_HOST= DB 엔드포인트 주소
DB_PORT= DB 포트번호 (default:3306)
DB_USERNAME= 사용자 명
DB_PASSWORD= 비밀번호
DB_NAME= DB 이름
DB_SYNC= DB table 동기화 여부 (default: true)
PASSWORD_HASH_ROUNDS= 로그인 비밀번호 해시 생성 강도 (default: 10)
JWT_SECRET= JWT 생성 및 검증 키
```

## 실행 방법

```sh
npm install
npm run start:dev
```

## 설계 문서

- ERD: https://dbdiagram.io/d/Final_Project_HappyMoney-658a371b89dea6279988f566

- 와이어프레임: https://www.figma.com/file/g1xNcU7RORoY56gcK8QJnz/Final_Project_Happy_Money?type=design&node-id=0-1&mode=design&t=ohgAuc10sJl9k2Yf-0

## Swagger 접속 주소

http://localhost:3000/api-docs

## 참고 자료

- Nest.js 공식 문서: https://docs.nestjs.com
- TypeORM 공식 문서: https://typeorm.io
- Joi: https://www.npmjs.com/package/joi
- Class Validator: https://www.npmjs.com/package/class-validator
- Validator: https://www.npmjs.com/package/validator
- Passport 공식 문서: https://www.passportjs.org/docs
