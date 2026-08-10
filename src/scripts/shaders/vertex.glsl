uniform float uRadius;
uniform float uScroll;
uniform float uTotalHeight;
uniform float uTime;

void main() {
  // メッシュの中心位置を取得
  float meshCenterY = modelMatrix[3].y;

  // スクロール量を考慮して、メッシュのZ座標をループさせる
  float rawZ = meshCenterY + uScroll;
  float halfH = uTotalHeight * 0.5;
  float loopedMeshZ = mod(rawZ + halfH, uTotalHeight) - halfH;

  float angle = -position.x / uRadius;
  float r = uRadius + position.y;

  // シリンダー座標系に変換
  vec3 cylPos;
  cylPos.x = r * cos(angle);
  cylPos.y = r * sin(angle);
  cylPos.z = loopedMeshZ + position.z;

  // 時間経過(uTime)によって変化するS字カーブとうねり
  float curveX = sin(cylPos.z * 0.25 + uTime * 0.8) * 1.5;
  float curveY = cos(cylPos.z * 0.15 + uTime * 0.6) * 0.8;

  cylPos.x += curveX;
  cylPos.y += curveY;

  gl_Position = projectionMatrix * viewMatrix * vec4(cylPos, 1.0);
}