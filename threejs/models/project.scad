// ============================================================
// Chinese New Year Cookies - OpenSCAD Parametric Modeling
// USC Computer Graphics Final Project
// FINAL: Love Letter = smooth hollow tube (bump texture in THREE.js)
// ============================================================

$fn = 50;

// -----------------------------------------------------------
// Parameter Zone
// -----------------------------------------------------------

// --- Pineapple Tart (凤梨酥) ---
PINEAPPLE_WIDTH  = 36;
PINEAPPLE_DEPTH  = 24;
PINEAPPLE_HEIGHT = 12;
PINEAPPLE_RADIUS = 2.0;
COLOR_GOLD = [0.95, 0.75, 0.25];

// --- Peanut Cookie (花生饼) ---
PEANUT_DIA = 30;
PEANUT_HEIGHT = 18;
PEANUT_BUMP_SEED = 42;
COLOR_BROWN = [0.65, 0.45, 0.25];

// --- Love Letter / Kuih Kapit (鸡蛋卷) ---
// Smooth hollow tube — baking texture handled in THREE.js bumpMap
LOVE_OUTER_DIA = 10;
LOVE_WALL = 0.7;
LOVE_LENGTH = 55;
COLOR_LIGHT_GOLD = [0.92, 0.82, 0.55];

// --- Butter Cookie with Cherry (奶油樱桃饼干) ---
BUTTER_DIA = 30;
BUTTER_HEIGHT = 8;
CHERRY_DIA = 10;
STEM_DIA = 2;
STEM_HEIGHT = 5;
COLOR_BUTTER = [0.98, 0.92, 0.65];
COLOR_CHERRY = [0.85, 0.15, 0.15];
COLOR_STEM = [0.25, 0.55, 0.20];

// --- Flower Cookie (梅花形饼干) ---
FLOWER_DIA = 35;
FLOWER_THICK = 8;
PETAL_DIA = 14;
CENTER_DIA = 12;
COLOR_PINK = [0.95, 0.60, 0.72];

// --- Chinese New Year Plate (新年圆盘) ---
PLATE_DIA = 180;
PLATE_HEIGHT = 10;
PLATE_DEPTH = 5;
PLATE_INNER_DIA = 165;
COLOR_PLATE = [0.55, 0.08, 0.08];

LAYOUT_RADIUS = 48;

// -----------------------------------------------------------
// 1. Pineapple Tart (凤梨酥)
// Rounded rectangular body, no grid pattern.
// -----------------------------------------------------------
module pineapple_tart() {
    color(COLOR_GOLD)
    translate([0, 0, PINEAPPLE_HEIGHT / 2])
    minkowski() {
        cube([
            PINEAPPLE_WIDTH  - PINEAPPLE_RADIUS * 2,
            PINEAPPLE_DEPTH  - PINEAPPLE_RADIUS * 2,
            PINEAPPLE_HEIGHT - PINEAPPLE_RADIUS * 2
        ], center = true);
        sphere(r = PINEAPPLE_RADIUS);
    }
}

// -----------------------------------------------------------
// 2. Peanut Cookie (花生饼)
// -----------------------------------------------------------
module peanut_cookie() {
    color(COLOR_BROWN)
    translate([0, 0, PEANUT_HEIGHT / 2])
    scale([1, 1, PEANUT_HEIGHT / PEANUT_DIA])
    union() {
        sphere(d = PEANUT_DIA);
        r = PEANUT_DIA / 2;
        rnd = rands(0, 1, 120, PEANUT_BUMP_SEED);
        for (i = [0 : 4 : 116]) {
            theta = rnd[i] * 360;
            phi   = rnd[i+1] * 70 + 10;
            x = r * sin(phi) * cos(theta) * 0.92;
            y = r * sin(phi) * sin(theta) * 0.92;
            z = r * cos(phi) * 0.92;
            crumb_d = 2.4 + rnd[i+2] * 1.8;
            translate([x, y, z])
                scale([1, 1, 0.65])
                sphere(d = crumb_d);
        }
    }
}

// -----------------------------------------------------------
// 3. Love Letter Single Roll
// SMOOTH hollow tube — no surface bumps (texture in THREE.js)
// F6 renders in seconds instead of minutes.
// -----------------------------------------------------------
module love_letter_single() {
    color(COLOR_LIGHT_GOLD)
    rotate([0, 90, 0])
    difference() {
        cylinder(d = LOVE_OUTER_DIA, h = LOVE_LENGTH, center = true);
        cylinder(d = LOVE_OUTER_DIA - LOVE_WALL * 2, h = LOVE_LENGTH + 1, center = true);
    }
}

// -----------------------------------------------------------
// 3b. Love Letter Pyramid Stack
// -----------------------------------------------------------
module love_letter_stack() {
    r = LOVE_OUTER_DIA / 2;
    translate([0, -r, r]) love_letter_single();
    translate([0, r, r]) love_letter_single();
    translate([0, 0, 15]) rotate([0, 0, 35]) love_letter_single();
}

// -----------------------------------------------------------
// 4. Butter Cookie with Cherry (奶油樱桃饼干)
// -----------------------------------------------------------
module butter_cherry() {
    union() {
        color(COLOR_BUTTER)
            cylinder(d = BUTTER_DIA, h = BUTTER_HEIGHT);
        color(COLOR_CHERRY)
            translate([0, 0, BUTTER_HEIGHT])
                sphere(d = CHERRY_DIA);
        color(COLOR_STEM)
            translate([0, 0, BUTTER_HEIGHT + CHERRY_DIA / 2 - 0.5])
                cylinder(d = STEM_DIA, h = STEM_HEIGHT);
    }
}

// -----------------------------------------------------------
// 5. Flower Cookie (梅花形饼干)
// -----------------------------------------------------------
module flower_cookie() {
    color(COLOR_PINK)
    union() {
        cylinder(d = CENTER_DIA, h = FLOWER_THICK);
        petal_offset = (FLOWER_DIA - PETAL_DIA) / 2;
        for (i = [0 : 4]) {
            rotate([0, 0, i * 72])
                translate([petal_offset, 0, 0])
                    cylinder(d = PETAL_DIA, h = FLOWER_THICK);
        }
    }
}

// -----------------------------------------------------------
// 6. Chinese New Year Plate (新年圆盘)
// -----------------------------------------------------------
module cny_plate() {
    color(COLOR_PLATE)
    difference() {
        cylinder(d = PLATE_DIA, h = PLATE_HEIGHT);
        translate([0, 0, PLATE_HEIGHT - PLATE_DEPTH])
            cylinder(d = PLATE_INNER_DIA, h = PLATE_DEPTH + 0.5);
    }
}

// ============================================================
// Final Assembly
// ============================================================
PLATE_FLOOR_Z = PLATE_HEIGHT - PLATE_DEPTH;

module full_scene() {
    cny_plate();

    // Pineapple Tart — bottom
    translate([0, -LAYOUT_RADIUS, PLATE_FLOOR_Z])
        pineapple_tart();

    // Peanut Cookie — right
    translate([LAYOUT_RADIUS, 0, PLATE_FLOOR_Z])
        peanut_cookie();

    // Love Letter Stack — top
    translate([0, LAYOUT_RADIUS, PLATE_FLOOR_Z])
        love_letter_stack();

    // Butter Cookie with Cherry — left
    translate([-LAYOUT_RADIUS, 0, PLATE_FLOOR_Z])
        butter_cherry();

    // Flower Cookie — center
    translate([0, 0, PLATE_FLOOR_Z])
        flower_cookie();
}

full_scene();