"use strict";

const DEVICE_UUID     = "928a3d40-e8bf-4b2b-b443-66d2569aed50";
let connectButton;

var head;
window.addEventListener(
  "load",
  function() {
    head = document.querySelector("#head");
    connectButton = document.querySelector("#BLECONN");
    connectButton.addEventListener("click", mainFunction);
  },
  false
);

async function mainFunction() 
{
  //光量と人の有無を管理
  var shiningValue = 0;
  var isExsitHuman = true;

  //判定に使う値
  var judgeLine = 200;

  var bleDevice = await navigator.bluetooth.requestDevice({
    filters: [{ services: [DEVICE_UUID] }] });
  console.log(bleDevice);
  var i2cAccess = await navigator.requestI2CAccess(bleDevice);
  connectButton.hidden = true;
  var port = i2cAccess.ports.get(1);

  //モータ
  var pca9685 = new PCA9685(port,0x40);
  //光センサ
  var groveLight = new GROVELIGHT(port, 0x29);

  var angle = 0;

  await groveLight.init();
  //モータをイニシャライズ。
  await pca9685.init(0.001,0.002,30);

  while (1) 
  {
    try 
    {
      var value = await groveLight.read();
      // console.log('value:', value);
      head.innerHTML = value ? value : head.innerHTML;
      if(value <judgeLine)
      {
        //指定したジャッジラインより光量が低ければ人がいると判定。
        isExsitHuman = true;
        console.log("human is exist!");
      }
      else
      {
        isExsitHuman = false;
        console.log("human is not exist...");
        angle = 30;
        await pca9685.setServo(0,angle);
        console.log(angle);
      }
      await sleep(200);
    } 
    catch (error) 
    {
      console.log(" Error : ", error);
    }

    // if(!isExsitHuman)
    // {
    //   //

    //   //カメラ認識の処理

    //   //
    // }

    // if(isBig)
    // {
    //   angle = 30;
    //   await pca9685.setServo(0,angle);
    //   console.log(angle);
    // }
    // else
    // {
    //   angle = -30;
    //   await pca9685.setServo(0,angle);
    //   console.log(angle);
    //   // if(angle >=60)
    //   // {
    //   //   await pca9685.setServo(0,0);
    //   // }
    // }

  }
}



function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}
