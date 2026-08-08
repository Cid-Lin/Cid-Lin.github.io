// Pineapple Tart Vertex Shader

varying vec3 vObjectPosition;

void pineappleVertexShader(inout vec3 transformed) {
    vObjectPosition = position;
}
