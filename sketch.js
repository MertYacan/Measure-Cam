let video;
let poseNet;
let pose;
let slider;
let errorMsg;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  
  slider = createSlider(155, 210, 182);
  slider.position(10, 450);
  slider.style('width', '80px');
}

function gotPoses(poses){
  console.log(poses);
  if (poses.length > 0){
    pose = poses[0].pose;
  }
}

function openVariableScreen(){
  //height stuff
  textAlign(LEFT);
  fill('black');
  rect(0, 430, 640, 50);
  fill('white');
  strokeWeight(1);
  textSize(15);
  text('Enter your height:', 10, 445);
  textSize(20);
  text(slider.value(), 100, 469);
  
  //error stuff
  if(errorMsg != ''){
    fill('red');
    textSize(15);
    text(errorMsg, 200, 435, 400, 470);
    
    //lets reset error msg
    errorMsg = '';
  }
}

function getColor(conf){
  //if confidence is high gives greenish, if not gives reddish color
  if(conf>0,5){
    fill(0,255,0);
  }else{
    let r = 255*(1-conf*2);
    let g = 255*(conf*2);
    fill(r,g,0);
  }
}

function modelLoaded(){
 console.log('poseNet ready!'); 
}

function draw() {
  image(video, 0, 0);
  
  
  if(pose){
    
    //red circles for every keypoints
   // for(let i = 0; i < pose.keypoints.length; i++){
    //  let x = pose.keypoints[i].position.x;
    //  let y = pose.keypoints[i].position.y;
    //  fill(255,0,0);
    //  strokeWeight(1);
    //  ellipse(x, y, 16, 16);
   // }
    
    //if some important keypoints are missing we can't calculate relative distance so don't make it start from beginning
    if(pose.leftEye.confidence > 0.2 && pose.rightEye.confidence > 0.2 && pose.leftAnkle.confidence > 0.2 && pose.rightAnkle.confidence > 0.2){
      
      if(pose.leftWrist.confidence > 0.2 && pose.rightWrist.confidence > 0.2){
        
        //just a line between hands
        stroke('orange');
        strokeWeight(10);
        line(pose.leftWrist.x, pose.leftWrist.y, pose.rightWrist.x, pose.rightWrist.y);
        stroke('black');
        
        //get hand dist
        let d = int(dist(pose.leftWrist.x, pose.leftWrist.y, pose.rightWrist.x, pose.rightWrist.y));
        
        //get dist: leftEye to leftAnkle ; rightEye to rightAnkle and find their average
        let leftD = int(dist(pose.leftEye.x, pose.leftEye.y, pose.leftAnkle.x, pose.leftAnkle.y));
        let rightD = int(dist(pose.rightEye.x, pose.rightEye.y, pose.rightAnkle.x, pose.rightAnkle.y));
        
        let averageDistEyeToAnkle = slider.value()*0.9;
        d = int(averageDistEyeToAnkle/(leftD/2+rightD/2)*d);
        fill('orange');
        strokeWeight(2);
        textSize(32);
        textAlign(CENTER);
        text(d, (pose.leftWrist.x+pose.rightWrist.x)/2, (pose.leftWrist.y+pose.rightWrist.y)/2);
        textSize(100);
        text(d, 320, 100);
      }else{
        //storing which points are missing to give an error
        let notDetected = '';
        
        if(pose.leftWrist.confidence < 0.2){
          notDetected += ' rightWrist';
        }
        if(pose.rightWrist.confidence < 0.2){
          notDetected += ' leftWrist';
        }
        
        errorMsg = 'ERROR: These keypoints are not visible on screen: ' + notDetected;
      }
    }else{
      //storing which points are missing to give an error
        let notDetected = '';
        
        if(pose.leftEye.confidence < 0.2){
          notDetected += ' rightEye';
        }
        if(pose.rightEye.confidence < 0.2){
          notDetected += ' leftEye';
        }
        if(pose.rightAnkle.confidence < 0.2){
          notDetected += ' rightAnkle';
        }
        if(pose.leftAnkle.confidence < 0.2){
          notDetected += ' leftAnkle';
        }
        
        errorMsg = 'ERROR: These keypoints are not visible on screen: ' + notDetected;
    }

    openVariableScreen();
    
  }
  
}