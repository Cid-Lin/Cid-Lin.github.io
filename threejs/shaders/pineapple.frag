// Pineapple Tart Fragment Shader

varying vec3 vObjectPosition;

float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);

    return mix(nxy0, nxy1, f.z);
}

vec3 applyPineappleBaking(vec3 baseColor) {
    float coarseNoise = valueNoise(vObjectPosition * 0.22);
    float fineNoise = valueNoise(vObjectPosition * 0.85);
    float bakedSpots = smoothstep(0.56, 0.84, coarseNoise * 0.72 + fineNoise * 0.28);

    float edgeX = smoothstep(12.5, 17.5, abs(vObjectPosition.x));
    float edgeZ = smoothstep(7.5, 11.5, abs(vObjectPosition.z));
    float edgeBake = max(edgeX, edgeZ);

    float topBake = smoothstep(5.0, 12.0, vObjectPosition.y);
    float browning = clamp(
        bakedSpots * 0.52 + edgeBake * 0.28 + topBake * 0.08,
        0.0,
        0.72
    );

    vec3 toastedColor = vec3(0.48, 0.20, 0.045);
    return mix(baseColor, toastedColor, browning);
}
