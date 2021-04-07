# selfcheck.js
자가진단 모듈 for Rhino

# 테스트 여/부
아직 테스트안함

# 예제소스
```javascript
const selfcheckM = require("selfcheck");
let selfcheck = new selfcheckM();

selfcheck.setschool("서울특별시", "서울중학교") //학교 설정

selfcheck.addUser("홍길동", "010101", "1234") //학생등록

selfcheck.request() //자가진단
```