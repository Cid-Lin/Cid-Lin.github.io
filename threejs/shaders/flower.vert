// Flower Cookie Vertex Shader

varying vec3 vFlowerObjectPosition;
uniform float uTime;

void flowerVertexShader(inout vec3 transformed) {
    vFlowerObjectPosition = position;

    float flowerRadius = length(position.xz);
    float flowerAngle = atan(position.z, position.x);
    float flowerEdgeMask = smoothstep(7.0, 16.5, flowerRadius);
    float flowerWave = sin(
        uTime * 2.0 +
        flowerAngle * 5.0 +
        flowerRadius * 0.16
    );

    transformed.y += flowerWave * flowerEdgeMask * 0.18;
}
