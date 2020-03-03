// % weight=10 color=#1E90FF icon="\uf136"
namespace hscobot {
    let serialInited = 0;
    let serialReadLine = "";
    
    export enum CarMode {
        //% blockId="Manual" block="Manual"
        Manual = 0,
        //% blockId="AIDrive" block="AI"
        AIDrive = 1,
        //% blockId="BallTracking" block="Ball Tracking"
        BallTracking=2,
        //% blockId="PersonDetect" block="Person Detect"
        PersonDetect=3,
        //% blockId="FaceDetect" block="Face Detect"
        FaceDetect=4
    }

    export enum ColorFilter {
        //% blockId="Red" block="Red"
        Red = 0,
        //% blockId="Green" block="Green"
        Green = 1,
        //% blockId="Blue" block="Blue"
        Blue = 2,
        //% blockId="Black" block="Black"
        Black = 3
    }

    export enum Directions {
        //% blockId="Positive" block="Positive"
        Positive = 0,
        //% blockId="Negative" block="Negative"
        Negative = 1
    }

    function initSerial(): void {
        if (0 == serialInited) {
            serial.setRxBufferSize(64)
            serial.redirect(
                SerialPin.P16,
                SerialPin.P8,
                BaudRate.BaudRate115200
            );
            serialInited = 1;
        }
    }

    function addParameter(i: number): string {
        let str = "";
        if (i < 10) {
            str = "00" + i;
        } else if (i < 100) {
            str = "0" + i;
        } else {
            str = (i).toString();
        }
        return str;
    }

   
    //% blockId=runMotor block="Manual mode run motor at left speed=%LeftSpeed direction=%LeftDirection right speed=%RightSpeed direction=%RightDirection"
    //% LeftSpeed.min=0 LeftSpeed.max=360
    //% LeftDirection.fieldEditor="gridpicker" LeftDirection.fieldOptions.columns=1
    //% RightSpeed.min=0 RightSpeed.max=360
    //% RightDirection.fieldEditor="gridpicker" RightDirection.fieldOptions.columns=1
    export function runMotor( LeftSpeed: number, LeftDirection: Directions, RightSpeed : number, RightDirection : Directions): void {
        initSerial();
        let cmd = "";
        let LD = "1"
        let RD = "1"
        if (LeftDirection == Directions.Negative)
            LD = "0"
        if (RightDirection == Directions.Negative)
            RD = "0"

        cmd = "CM" + LD + RD + addParameter(LeftSpeed) + addParameter(RightSpeed);
        serial.writeLine(cmd);
    }

    //% blockId=stopCar block="Stop car in manual mode"
    export function stopCar(): void {
        runMotor(0, Directions.Positive, 0, Directions.Positive);
    }

    //% blockId=pauseAI block="Pause AI Model"
    export function pauseAI(): void {
        initSerial();
        let cmd2 = "EXPS+++++0"; // Pause
        serial.writeLine(cmd2);
    }

    //% blockId=resumeAI block="Resume AI Model"
    export function resumeAI(): void {
        initSerial();
        let cmd3 = "EXPS+++++1"; 
        serial.writeLine(cmd3);
    }

    //% blockId=rebootAIModule block="Reboot AI module"
    export function rebootAIModule():void {
        let cmd4 = "EXRS++++++"
        initSerial();
        serial.writeLine(cmd4);
        basic.pause(3000)
    }

    //% weight=90
    //% blockId=switchAIMode block="Switch car mode to |%mode"
    //% mode.fieldEditor="gridpicker" mode.fieldOptions.columns=2
    export function switchAIMode(mode: CarMode): void {
        let cmd5 = "";
        initSerial();
        switch (mode) {
            case CarMode.Manual:
                cmd5 = "EXPS+++++0"; // Pause
                break;
            case CarMode.AIDrive:
                cmd5 = "EXMO+++++0"
                break;
            case CarMode.BallTracking:
                cmd5 = "EXMO+++++1"
                break;
            case CarMode.PersonDetect:
                cmd5 = "EXMO+++++2"
                break;
            case CarMode.FaceDetect:
                cmd5 = "EXMO+++++3"
                break;
        }

        if (cmd5.length > 0) {
            serial.writeLine(cmd5);
            basic.pause(100);
        }
    }
  
    //% weight=90
    //% blockId=changeAIColor block="Change AI color to |%color"
    //% color.fieldEditor="gridpicker" color.fieldOptions.columns=2
    export function changeAIColor(color: ColorFilter): void {
        let cmd6 = "EXCO+++++" + (color).toString();
        initSerial();       
        serial.writeLine(cmd6);
        basic.pause(100);
    }

    //% blockId=turnOnLED block="Turn on LED lights"
    export function turnOnLED() : void {
        initSerial();
        serial.writeLine("CHON");
    }
    
    //% blockId=turnOffLED block="Turn off LED lights"
    export function turnOffLED(): void {
        initSerial();
        serial.writeLine("CHOFF");
    }

    //% blockId=turnOnBuzzer block="Turn on buzzer"
    export function turnOnBuzzer() : void {
        initSerial();
        serial.writeLine("CBON");
    }

    //% blockId=turnOffBuzzer block="Turn off buzzer"
    export function turnOffBuzzer(): void {
        initSerial();
        serial.writeLine("CBOFF");
    }

    //% blockId=queryBattery block="Query car battery"
    export function queryBattery() : void {
        initSerial();
        serial.writeLine("CTINFO");
    }

    //% blockId=setRGBColor block="set car left RGB light=%leftRGB right RGB=%rightRGB"
    //% leftRGB.shadow="colorNumberPicker"
    //% rightRGB.shadow="colorNumberPicker"
    export function setRGBColor(leftRGB: number, rightRGB: number) : void {

    }

    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        serialReadLine = serial.readLine();
        console.log("serial read:" + serialReadLine)
    })

    //% weight=120
    //% blockId=connectWIFI block="connect to WIFI, ssid=%ssid password=%pin"
    export function connectWIFI(ssid: string, password: string) : void {
        let cmdConnect = "AT+CWJAP_DEF=\"" + ssid + "\",\"" + password + "\""
        serial.writeString(cmdConnect)
        serial.readString()
        basic.pause(5000)
    }

    //% weight=120
    //% blockId=setWifiWaitforConnect block="Set WIFI enter wait for connect mode"
    export function setWifiWaitforConnect() : void {

    }

    //% weight=120
    //% blockId=exitWifiWaitforConnect block="Set WIFI exit wait for connect mode"
    export function exitWifiWaitforConnect() : void {

    }
}
