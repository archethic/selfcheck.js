importClass(org.jsoup.Jsoup);
const FS = FileStream;
const path = "/sdcard/msgbot/setting.json"
module.exports = (function () {
    "use strict";
    if (!FS.read(path)) FS.write(path, "[]");
    function selfCheck() {
        this.setting = {
            userInfo: JSON.parse(FS.read(path)),
            baseURL: "",
            orgCode: "",
            tokenUser: "",
            tokenPass: "",
            location: ""
        }
        this.key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHjJzGs9MMMWtQIDAQAB";
    }

    selfCheck.prototype.addUser = function (name, birth, passcode) {
        if(birth.length != 6) throw new Error("brith is must 6 length");
        this.setting.userInfo.push({
            "originalName": name,
            "encryptName": this.encrypt(name),
            "birth_day": this.encrypt(passcode),
            "passcode": passcode
        })
        FS.write(path, JSON.stringify(this.setting.userInfo, null, 4));
        return true;
    }

    selfCheck.prototype.setschool = function (loc, schoolName) {
        if(loc == undefined || loc == "" || schoolName == undefined || schoolName == "") throw new ReferenceError("loc, schoolName is not defined");
        if(loc.indexOf("서울") !== -1) this.setting.location = "01";
        else if(loc.indexOf("부산") !== -1) this.setting.location = "02";
        else if(loc.indexOf("대구") !== -1) this.setting.location = "03";
        else if(loc.indexOf("인천") !== -1) this.setting.location = "04";
        else if(loc.indexOf("광주") !== -1) this.setting.location = "05";
        else if(loc.indexOf("대전") !== -1) this.setting.location = "06";
        else if(loc.indexOf("울산") !== -1) this.setting.location = "07";
        else if(loc.indexOf("세종") !== -1) this.setting.location = "08";
        else if(loc.indexOf("경기도") !== -1) this.setting.location = "09";
        else if(loc.indexOf("강원도") !== -1) this.setting.location = "10";
        else if(loc.indexOf("충청북도") !== -1) this.setting.location = "11";
        else if(loc.indexOf("충청남도") !== -1) this.setting.location = "12";
        else if(loc.indexOf("전라북도") !== -1) this.setting.location = "13";
        else if(loc.indexOf("전라남도") !== -1) this.setting.location = "14";
        else if(loc.indexOf("경상북도") !== -1) this.setting.location = "15";
        else if(loc.indexOf("경상남도") !== -1) this.setting.location = "16";
        else if(loc.indexOf("제주") !== -1) this.setting.location = "17";
        else throw new TypeError("Loc is not input range");

        const response = JSON.parse(Jsoup.connect("https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=" + this.setting.location +"&orgName="+ schoolName +"&loginType=school")
            .ignoreContentType(true).get().text())
        if(response.schulList.length > 1) throw new Error("more school");
        this.setting.orgCode = response.schulList[0].orgCode;
        this.setting.baseURL = response.schulList[0].atptOfcdcConctUrl;
    }

    selfCheck.prototype.submit = function (i) {
        this.setting.tokenUser = JSON.parse(Jsoup.connect("https://"  + this.setting.baseURL + "/v2/findUser")
            .header("Content-Type", "application/json;charset=UTF-8").requestBody(JSON.stringify({
                "orgCode": this.orgCode,
                "name": this.setting.userInfo[i].encryptName,
                "birthday": this.setting.userInfo[i].birth_day,
                "loginType": "school"
            })).ignoreContentType(true).ignoreHttpErrors(true).post().text()).token;
        this.setting.tokenPass = Jsoup.connect("https://" + this.setting.baseURL + "/v2/validatePassword")
            .header("Content-Type", "application/json").header("Authorization", this.setting.tokenUser)
            .requestBody(JSON.stringify({
                "password": this.encrypt(this.setting.userInfo[i].passcode),
                "deviceUuid": ""
            })).ignoreContentType(true).ignoreHttpErrors(true).post().text();
        return Jsoup.connect("https://" + this.setting.baseURL + "/registerServey")
            .header("Content-Type", "application/json").header("Authorization", this.setting.tokenPass)
            .requestBody(JSON.stringify({
                "rspns01": "1",
                "rspns02": "1",
                "rspns09": "0",
                "rspns00": "Y",
                'upperToken': this.setting.tokenPass,
                'upperUserNameEncpt': this.setting.userInfo[i].originalName
            })).ignoreContentType(true).ignoreHttpErrors(true).post().text();
    }

    selfCheck.prototype.request = function () {
        let result = new Array();
        for(var i = 0; i < this.setting.userInfo.length; i++) {
            result[i] = (i + 1) + "번 " + this.setting.userInfo.originalName + "\n" + this.submit(i) + "\n\n";
        }
        let res = "";
        for(i = 0;i < this.setting.userInfo.length;i++) {
            res += result[i];
        }
        return res, true;
    }

    /**
     * Code by 새싹맴버
     * @param {String} str encryptString
     * @returns 
     */
    selfCheck.prototype.encrypt = function (str) {
        let bytes = android.util.Base64.decode(this.key, android.util.Base64.DEFAULT);
        let keyFactory = java.security.KeyFactory.getInstance("RSA");
        let pubKey = keyFactory.generatePublic(new java.security.spec.X509EncodedKeySpec(bytes));
        let cipher = javax.crypto.Cipher.getInstance("RSA/None/PKCS1Padding");
        cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, pubKey);
        let byte = cipher.doFinal(new java.lang.String(str).getBytes("UTF-8"));
        let result = android.util.Base64.encodeToString(byte, android.util.Base64.DEFAULT);

        return result;
    }

    return selfCheck;
})();