// Flower Cookie Fragment Shader

varying vec3 vFlowerObjectPosition;

float flowerHash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

float flowerValueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = flowerHash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = flowerHash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = flowerHash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = flowerHash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = flowerHash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = flowerHash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = flowerHash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = flowerHash31(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);

    return mix(nxy0, nxy1, f.z);
}

vec3 applyFlowerMaterial(vec3 baseColor) {
    vec2 flowerXZ = vFlowerObjectPosition.xz;
    float flowerR = length(flowerXZ);
    float flowerAngle = atan(flowerXZ.y, flowerXZ.x);

    float flowerPetalMask = 0.5 + 0.5 * cos(flowerAngle * 5.0);
    float flowerCenterGlow = 1.0 - smoothstep(0.0, 7.0, flowerR);
    float flowerPetalBody = smoothstep(5.5, 15.5, flowerR);
    float flowerPetalEdge = smoothstep(11.5, 18.0, flowerR);
    float flowerTopMask = smoothstep(1.0, 7.8, vFlowerObjectPosition.y);

    float flowerCoarseNoise = flowerValueNoise(vFlowerObjectPosition * 0.28);
    float flowerFineNoise = flowerValueNoise(vFlowerObjectPosition * 1.1);
    float flowerSugarNoise = flowerValueNoise(vFlowerObjectPosition * 2.8);

    float flowerSugarSpeck =
        smoothstep(0.78, 0.94, flowerSugarNoise) *
        (0.35 + 0.65 * flowerTopMask);

    float flowerToast =
        smoothstep(
            0.55,
            0.82,
            flowerCoarseNoise * 0.7 + flowerFineNoise * 0.3
        ) * 0.35;

    float flowerPetalVariation =
        flowerPetalMask * flowerPetalBody * 0.18;

    vec3 flowerBasePink = vec3(0.95, 0.60, 0.72);
    vec3 flowerCenterPink = vec3(0.99, 0.78, 0.84);
    vec3 flowerEdgePink = vec3(0.84, 0.36, 0.54);
    vec3 flowerToastedPink = vec3(0.72, 0.30, 0.38);
    vec3 flowerSugarColor = vec3(1.0, 0.95, 0.96);

    vec3 flowerCookieColor = flowerBasePink;
    flowerCookieColor = mix(
        flowerCookieColor,
        flowerCenterPink,
        flowerCenterGlow * 0.85
    );
    flowerCookieColor = mix(
        flowerCookieColor,
        flowerEdgePink,
        flowerPetalEdge * (0.35 + flowerPetalVariation)
    );
    flowerCookieColor = mix(
        flowerCookieColor,
        flowerToastedPink,
        flowerToast * (0.45 + flowerPetalEdge * 0.35)
    );
    flowerCookieColor = mix(
        flowerCookieColor,
        flowerSugarColor,
        flowerSugarSpeck * 0.32
    );

    return flowerCookieColor;
}
