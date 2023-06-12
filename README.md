## 소개

## 데모 프론트

- https://auth-react-one.vercel.app/

## 상세 기능

### 사용자 등록 및 로그인

- 사용자 시스템에 회원가입시 이메일 검증 프로세스(링크, 인증코드)
- 사용자 로그인후 access-token, refresh-token 생성
- 로그인된 사용자 refresh-token 캐시서버에서 관리

### 비밀번호 관리

- Salt 해싱 기술을 사용한 암호의 안전한 저장

### 가입 모드 구성

- 가입 프로세스를 LINK, TOTP, NoEmailVerification 모드로 런타임중 업데이트
- LINK로 설정되어 있는 경우 확인 링크가 사용자의 이메일로 전송
- TOTP로 설정된 경우 확인 코드가 생성되어 사용자의 이메일로 전송
- NoEmailVerification로 가입 모드가 설정된 경우 사용자 이메일검증X

### 토큰 관리

- 사용자 로그아웃시 토큰 취소 기능
- refresh-token으로 access-token 발급
- redis 캐시 서버를 사용하여 token 관리

### 인증과 인가

- 권한 부여하여 API에 대한 액세스를 제어
- Gurad에서 사용자 인증 및 허가 처리
