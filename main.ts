//% weight=10 color=#1E90FF icon="\uf136"
namespace Rover {
    let serialInited = 0;
    let serialReadLine = "";
    
    export enum CarMode {
        //% blockId="Manual" block="Manual"
        Manual = 0,
        //% blockId="AIDrive" block="AI Drive"
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
                BaudRate.BaudRate9600 //BaudRate.BaudRate115200
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

    //% weight=90
    //% blockId=runMotor block="Manual mode run motor at left speed=%LeftSpeed direction=%LeftDirection right speed=%RightSpeed direction=%RightDirection"
    //% LeftSpeed.min=0 LeftSpeed.max=360
    //% LeftDirection.fieldEditor="gridpicker" LeftDirection.fieldOptions.columns=1
    //% RightSpeed.min=0 RightSpeed.max=360
    //% RightDirection.fieldEditor="gridpicker" RightDirection.fieldOptions.columns=1
    //% inlineInputMode=inline
    export function runMotor( LeftSpeed: number, LeftDirection: Directions, RightSpeed : number, RightDirection : Directions): void {
        initSerial();
        let cmd = "";
        let LD = "1"
        let RD = "1"
        if (LeftDirection == Directions.Negative)
            LD = "0"
        if (RightDirection == Directions.Negative)
            RD = "0"

        cmd = "CM" + LD + RD + addParameter(LeftSpeed) + addParameter(RightSpeed)+"\n";
        serial.writeString(cmd);
    }

    //% weight=90
    //% blockId=stopCar block="Stop car in manual mode"
    export function stopCar(): void {
        runMotor(0, Directions.Positive, 0, Directions.Positive);
    }

    //% weight=90
    //% blockId=pauseAI block="Pause AI Model"
    export function pauseAI(): void {
        initSerial();
        let cmd2 = "EXPS+++++0\n"; // Pause
        serial.writeString(cmd2);
    }

    //% weight=90
    //% blockId=resumeAI block="Resume AI Model"
    export function resumeAI(): void {
        initSerial();
        let cmd3 = "EXPS+++++1\n"; 
        serial.writeString(cmd3);
    }

    //% weight=90
    //% blockId=rebootAIModule block="Reboot AI module"
    export function rebootAIModule():void {
        let cmd4 = "EXRS++++++\n"
        initSerial();
        serial.writeString(cmd4);
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
                cmd5 = "EXPS+++++0\n"; // Pause
                break;
            case CarMode.AIDrive:
                cmd5 = "EXMO+++++0\n"
                break;
            case CarMode.BallTracking:
                cmd5 = "EXMO+++++1\n"
                break;
            case CarMode.PersonDetect:
                cmd5 = "EXMO+++++2\n"
                break;
            case CarMode.FaceDetect:
                cmd5 = "EXMO+++++3\n"
                break;
        }

        if (cmd5.length > 0) {
            serial.writeString(cmd5);
            basic.pause(100);
        }
    }
  
    //% weight=90
    //% blockId=changeAIColor block="Change AI color to |%color"
    //% color.fieldEditor="gridpicker" color.fieldOptions.columns=2
    export function changeAIColor(color: ColorFilter): void {
        let cmd6 = "EXCO+++++" + (color).toString() +"\n";
        initSerial();       
        serial.writeString(cmd6);
        basic.pause(100);
    }

    //% weight=90
    //% blockId=queryLineSensor block="Query line sensor status"
    export function queryLineSensor() : void {
        initSerial();
        serial.writeString("CLINFO\n");
        basic.pause(20);
    }
    
    //% weight=90
    //% blockId=querySonarDistance block="Query sonar distance(CM)"
    export function querySonarDistance() : void {
        initSerial();
        serial.writeString("CUINFO\n");
        basic.pause(100);
    }
    
     //% weight=90
    //% blockId=TurnOnAutomaticObstacleAvoidance block="Turn on automatic obstacle avoidance"
    export function TurnOnAutomaticObstacleAvoidance() : void {
        initSerial();
        serial.writeString("CTCKON=1\n");
    }
    
     //% weight=90
    //% blockId=TurnOffAutomaticObstacleAvoidance block="Turn off automatic obstacle avoidance"
    export function TurnOffAutomaticObstacleAvoidance() : void {
        initSerial();
        serial.writeString("CTCKON=0\n");
    }
    /*
    //CTCKUD=xxxx  //超声障碍物停车距离 单位CM 默认20
    //CTCKIR=xxxx  //linesensor阀值 单位mV 默认1600
    //CTCKS1=xxxx  //Tracking normal speed //直行速度 默认200
    //CTCKS2=xxxx  //Tracking slow speed //左/右转 慢速轮速度 默认100
    //CTCKS3=xxxx  //Tracking fast speed //左/右转 快速轮速度 默认250  
    //CGYRO=0     //返回六轴xyz加速度
    //mpu6050buf[0]=+/-
    //mpu6050buf[1] = x_data/10000+0x30;mpu6050buf[2] = x_data/1000%10+0x30;
    //mpu6050buf[3] = x_data/100%10+0x30;
      mpu6050buf[4] = x_data/10%10+0x30;
      mpu6050buf[5] = x_data%10+0x30;
      mpu6050buf[6] = '\n'
      mpu6050buf[7]  = y_data/10000+0x30;
      mpu6050buf[8]  = y_data/1000%10+0x30;
      mpu6050buf[9]  = y_data/100%10+0x30;
      mpu6050buf[10] = y_data/10%10+0x30;
      mpu6050buf[11] = y_data%10+0x30;
      mpu6050buf[13] = z_data/10000+0x30;
      mpu6050buf[14] = z_data/1000%10+0x30;
      mpu6050buf[15] = z_data/100%10+0x30;
      mpu6050buf[16] = z_data/10%10+0x30;
      mpu6050buf[17] = z_data%10+0x30;
      */

     //% weight=90
    //% blockId=queryVoltage block="Query voltage(mv)"
    export function queryVoltage() : void {
        initSerial();
        serial.writeString("CVINFO\n");
        basic.pause(100);
    }
    //% weight=90
    //% blockId=turnOnLED block="Turn on LED lights"
    export function turnOnLED() : void {
        initSerial();
        serial.writeString("CHON\n");
    }
    
    //% weight=90
    //% blockId=turnOffLED block="Turn off LED lights"
    export function turnOffLED(): void {
        initSerial();
        serial.writeString("CHOFF\n");
    }

    //% weight=90
    //% blockId=turnOnBuzzer block="Turn on buzzer"
    export function turnOnBuzzer() : void {
        initSerial();
        serial.writeString("CBON\n");
    }

    //% weight=90
    //% blockId=turnOffBuzzer block="Turn off buzzer"
    export function turnOffBuzzer(): void {
        initSerial();
        serial.writeString("CBOFF\n");
    }

    //% weight=90
    //% blockId=queryBattery block="Query car battery"
    export function queryBattery() : void {
        initSerial();
        serial.writeString("CTINFO\n");
    }
    

    //% weight=90
    //% blockId=setRGBColor block="set RGB light left red=%leftRed green=%leftGreen blue=%leftBlue right red=%rightRed green=%rightGreen blue=%rightBlue"
    //% leftRed.min=0 leftRed.max=255
    //% leftGreen.min=0 leftGreen.max=255
    //% leftBlue.min=0 leftBlue.max=255
    //% rightRed.min=0 rightRed.max=255
    //% rightGreen.min=0 rightGreen.max=255
    //% rightBlue.min=0 rightBlue.max=255
    //% inlineInputMode=inline
    export function setRGBColor(leftRed: number, leftGreen:number, leftBlue:number,
                                rightRed: number, rightGreen:number, rightBlue:number) : void {
        let rgbcmd = "CR" + addParameter(leftRed) + addParameter(leftGreen) + addParameter(leftBlue) + 
            addParameter(rightRed) + addParameter(rightGreen) + addParameter(rightBlue)+"\n";
        serial.writeString(rgbcmd)
    }

    //% weight=80
    //% blockId=connectWIFI block="connect to WIFI, ssid=%ssid password=%pin"
    export function connectWIFI(ssid: string, password: string) : void {
        let cmdConnect = "AT+CWJAP_DEF=\"" + ssid + "\",\"" + password + "\""
        serial.writeString(cmdConnect)
        serial.readString()
        basic.pause(5000)
    }

    //% weight=80
    //% blockId=setWifiWaitforConnect block="Set WIFI enter wait for connect mode"
    export function setWifiWaitforConnect() : void {
        serial.writeString("TCON")
    }

    //% weight=80
    //% blockId=exitWifiWaitforConnect block="Set WIFI exit wait for connect mode"
    export function exitWifiWaitforConnect() : void {
        serial.writeString("TCOFF")
    }

    let ctBattery = 0
    let cvValue = 0
    let cuValue = 0
    let line1Value = 0
    let line2Value = 0
    let line3Value = 0
    let line4Value = 0
    
    //% weight=80
    //% blockId=battery block="Get battery value"
    export function battery() : number {
        return ctBattery
    }
    
    //% weight=80
    //% blockId=voltage block="Get voltage value"
    export function voltage(): number {
        return cvValue
    }
    
    //% weight=80
    //% blockId=sonarDistance block="Get sonar distance"
    export function sonarDistance(): number {
        return cuValue
    }
    
    //% weight=80
    //% blockId=lineSensor1 block="Get line sensor 1 value"
    export function lineSensor1(): number {
        return line1Value
    }

    //% weight=80
    //% blockId=lineSensor2 block="Get line sensor 2 value"
    export function lineSensor2(): number {
        return line2Value
    }
    
    //% weight=80
    //% blockId=lineSensor3 block="Get line sensor 3 value"
    export function lineSensor3(): number {
        return line3Value
    }
    
    //% weight=80
    //% blockId=lineSensor4 block="Get line sensor 4 value"
    export function lineSensor4(): number {
        return line4Value
    }    
    
    //% weight=80
    //% blockId=changeLineSensorThreshold block="Change line sensor threshold=%threshold"
    //% threshold.defl=1600
    export function changeLineSensorThreshold(threshold: number): void {
        let cm = "CTCKIR="
        if( threshold < 0)
            threshold = 0
        if( threshold > 10000)
            threshold = 9999
            
        if( threshold < 10)
            cm += "000"+threshold
        else if( threshold < 100 )
            cm += "00"+threshold
        else if( threshold < 1000 )
            cm += "0"+threshold    
        else if( threshold < 10000)
            cm += threshold
    }
    
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        serialReadLine = serial.readLine();
        //basic.showString(serialReadLine)
        
        if ( serialReadLine.length > 2 ) {
            let cmd = serialReadLine.substr(0,2)
            if( cmd === "CL" ) {
                line1Value = parseInt(serialReadLine.substr(2,1))
                line2Value = parseInt(serialReadLine.substr(3,1))
                line3Value = parseInt(serialReadLine.substr(4,1))
                line4Value = parseInt(serialReadLine.substr(5,1))
            }
            else if( cmd === "CV" ) {
                cvValue = parseInt(serialReadLine.substr(2))
            } else if( cmd === "CU" ) {
                cuValue = parseInt(serialReadLine.substr(2))
            } else if( cmd === "CT" ) {
                ctBattery = parseInt(serialReadLine.substr(2))
            }
        }
    })
}
