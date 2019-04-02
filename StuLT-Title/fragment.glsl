precision mediump float;

uniform float time;
uniform vec2 resolution;

float sdLightBall(vec2 pos, float zoomOut) {
    return 1.0 - length(pos) * zoomOut;
}

void main() {
	vec2 p = gl_FragCoord.xy / resolution.x;
	p = p - 0.3 * vec2(resolution.x / resolution.y, 1.0);

    vec2 np = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    float c, r, g, b;
	c = length(p) * 0.33;

	if (step(0.5, fract(atan(p.x, p.y) * 3.0)) != step(0.5, fract(1.0 / c + time / 0.08))) {
        // tunel
        r += c;
        g += c;
        b += c;

        // ball
        float dt = 0.0;
        float dr = 0.1;
        float ds = 0.0;

        for (int i = 0; i < 12; i++) {
            float t = time * 4.0;
            float dx = cos(t + dt);
            float dy = sin(t + dt);

            float f = 0.3;
            dx += f;
            dy += f;

            float ballPower = sdLightBall(np + vec2(dx, dy) * dr, 26.0 + ds) * 1.3;

            if (ballPower > 0.0) {
                g += ballPower * 0.1;
                b += ballPower;
            }

            ds += 0.7;
            dt += 12.0;
            dr += 0.1;
        }

        gl_FragColor = vec4(r, g, b, 0.25);
    }
}
