(() => {
      // GLSL理解した
      window.onload = init;

      function init() {
            console.log('[OK]onload');

            let canvas = document.getElementById('webgl-canvas');
            let height = 512;
            let width = 512;

            document.body.style.zoom = 0.75;
            canvas.addEventListener('mousemove', mousemove);
            document.getElementsByTagName('button')[0].addEventListener('click', submit);

            let time = {
                start: null,
                count: null
            };

            let mouse = {
                x: null,
                y: null
            };

            let define = {
                sat: 0.6,
                check: 1.0,
                light_size: 0.05,
                box_size: 16.0
            };

            let rgb_balance = {
                red: 0.0,
                green: 0.0,
                blue: 1.0
            };

            canvas.height = height;
            canvas.width = width;

            let gl_ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            let program = create_program(create_shader('vs'), create_shader('fs'));

            let uniform = [];
            uniform[0] = gl_ctx.getUniformLocation(program, 'time');
            uniform[1] = gl_ctx.getUniformLocation(program, 'resolution');
            uniform[2] = gl_ctx.getUniformLocation(program, 'mouse');

            /*
                  #define sat 0.4
                  #define check 1.0
                  #define light_size 0.05
            */

            uniform[3] = gl_ctx.getUniformLocation(program, 'sat');
            uniform[4] = gl_ctx.getUniformLocation(program, 'check');
            uniform[5] = gl_ctx.getUniformLocation(program, 'light_size');
            uniform[6] = gl_ctx.getUniformLocation(program, 'box_size');

            // RGB balance
            uniform[7] = gl_ctx.getUniformLocation(program, 'red');
            uniform[8] = gl_ctx.getUniformLocation(program, 'green');
            uniform[9] = gl_ctx.getUniformLocation(program, 'blue');

            let position = [
                  -1.0,  1.0,  0.0,
                  1.0,  1.0,  0.0,
                  -1.0, -1.0,  0.0,
                  1.0, -1.0,  0.0
            ];

            let index = [
                  0, 2, 1,
                  1, 2, 3
            ];

            let vbo_Index = create_ibo(index);
            let vbo_Position = create_vbo(position);
            let vbo_AttLocation = gl_ctx.getAttribLocation(program, 'position');

            gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, vbo_Position);
            gl_ctx.enableVertexAttribArray(vbo_AttLocation);
            gl_ctx.vertexAttribPointer(vbo_AttLocation, 3, gl_ctx.FLOAT, false, 0, 0);
            gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, vbo_Index);
            gl_ctx.clearColor(0.0, 0.0, 0.0, 1.0);

            tick();

            function tick() {
                if (time.start === null) {
                    time.start = new Date().getTime();
                    time.count = 0;

                    console.log('[OK]tick');
                }

                // color from html input
                colors = Array.from(document.getElementsByClassName('colors')).map(dom => dom.value);
                rgb_balance.red = colors[0];
                rgb_balance.green = colors[1];
                rgb_balance.blue = colors[2];

                time.count ++;
                let time_stamp = ((time.start + time.count) - time.start) * 0.02;
                gl_ctx.clear(gl_ctx.COLOR_BUFFER_BIT);

                gl_ctx.uniform1f(uniform[0], time_stamp + 0.0);
                gl_ctx.uniform2fv(uniform[1], [width, height]);
                gl_ctx.uniform2fv(uniform[2], [mouse.x, mouse.y]);

                gl_ctx.uniform1f(uniform[3], define.sat);
                gl_ctx.uniform1f(uniform[4], define.check);
                gl_ctx.uniform1f(uniform[5], define.light_size);
                gl_ctx.uniform1f(uniform[6], define.box_size);

                gl_ctx.uniform1f(uniform[7], rgb_balance.red);
                gl_ctx.uniform1f(uniform[8], rgb_balance.green);
                gl_ctx.uniform1f(uniform[9], rgb_balance.blue);

                gl_ctx.drawElements(gl_ctx.TRIANGLES, 6, gl_ctx.UNSIGNED_SHORT, 0);
                gl_ctx.flush();

                requestAnimationFrame(tick);
            }

            function create_program(vs, fs) {
                  let stack = gl_ctx.createProgram();

                  gl_ctx.attachShader(stack, vs);
                  gl_ctx.attachShader(stack, fs);
                  gl_ctx.linkProgram(stack);

                  if (gl_ctx.getProgramParameter(stack, gl_ctx.LINK_STATUS)) {
                        gl_ctx.useProgram(stack);
                        return stack;
                  } else {
                        return null;
                  }
            }

            function create_shader(id) {
                  let shader;
                  let script = document.getElementById(id);

                  switch(script.type){
                        case 'x-shader/x-vertex':
                              shader = gl_ctx.createShader(gl_ctx.VERTEX_SHADER);
                              break;

                        case 'x-shader/x-fragment':
                              shader = gl_ctx.createShader(gl_ctx.FRAGMENT_SHADER);
                              break;
                  }

                  gl_ctx.shaderSource(shader, script.text);
                  gl_ctx.compileShader(shader);

                  if (gl_ctx.getShaderParameter(shader, gl_ctx.COMPILE_STATUS)) {
                        return shader;
                  } else {
                        alert(gl_ctx.getShaderInfoLog(shader));
                        console.log(gl_ctx.getShaderInfoLog(shader));
                  }
            }

            function create_vbo(data) {
                  let vbo = gl_ctx.createBuffer();
                  gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, vbo);
                  gl_ctx.bufferData(gl_ctx.ARRAY_BUFFER, new Float32Array(data), gl_ctx.STATIC_DRAW);
                  gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, null);

                  return vbo;
            }

            function create_ibo(data) {
                  let ibo = gl_ctx.createBuffer();
                  gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, ibo);
                  gl_ctx.bufferData(gl_ctx.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl_ctx.STATIC_DRAW);
                  gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, null);

                  return ibo;
            }

            // custom functions
            function submit() {
                  let input = Array.from(document.getElementsByClassName('input-box')).map(dom => isNaN(dom.value) || dom.value < 0.0 ? 0.0 : Number(dom.value));

                  define.sat = input[0];
                  define.light_size = input[1];
                  define.box_size = input[2];
            }

            function mousemove(event) {
                let rect = event.target.getBoundingClientRect();
                let x = event.clientX - rect.left;
                let y = event.clientY - rect.top;

/*
                mouse.x = x;//(x - 256) / 256;
                mouse.y = -(y - 180);
*/

                console.log(mouse.x, mouse.y);

                //mouse.x = x - 256;
                //mouse.y = -(y - 256);
            }
      }
})();
