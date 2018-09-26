(() => {
      // GLSL理解した
      window.onload = init;

      function init() {
            console.log('OK');

            let time = {
                  start: null,
                  count: null
            };

            let define = {
                  sat: 0.4,
                  check: 1.0,
                  l_size: 0.05
            };

            let rgb_balance = {
                  red: 0.0,
                  green: 0.0,
                  blue: 1.0
            };

            let canvas = document.getElementById('webgl-canvas');
            let height = 512;
            let width = 512;

            canvas.height = height;
            canvas.width = width;

            let gl_ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            let program = create_program(create_shader('vs'), create_shader('fs'));

            let uniform = [];
            uniform[0] = gl_ctx.getUniformLocation(program, 't'); // time
            uniform[1] = gl_ctx.getUniformLocation(program, 'r'); // resolution

            /*
                  #define sat 0.4
                  #define check 1.0
                  #define l_size 0.05
            */

            uniform[2] = gl_ctx.getUniformLocation(program, 'sat');
            uniform[3] = gl_ctx.getUniformLocation(program, 'check');
            uniform[4] = gl_ctx.getUniformLocation(program, 'l_size');

            // RGB balance
            uniform[5] = gl_ctx.getUniformLocation(program, 'red');
            uniform[6] = gl_ctx.getUniformLocation(program, 'green');
            uniform[7] = gl_ctx.getUniformLocation(program, 'blue');

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

            time.start = new Date().getTime();
            time.count = 0;
            tick();

            function tick() {
                  time.count ++;
                  let time_stamp = ((time.start + time.count) - time.start) * 0.02;
                  gl_ctx.clear(gl_ctx.COLOR_BUFFER_BIT);

                  gl_ctx.uniform1f(uniform[0], time_stamp + 0.0);
                  gl_ctx.uniform2fv(uniform[1], [width, height]);

                  gl_ctx.uniform1f(uniform[2], define.sat);
                  gl_ctx.uniform1f(uniform[3], define.check);
                  gl_ctx.uniform1f(uniform[4], define.l_size);

                  gl_ctx.uniform1f(uniform[5], rgb_balance.red);
                  gl_ctx.uniform1f(uniform[6], rgb_balance.green);
                  gl_ctx.uniform1f(uniform[7], rgb_balance.blue);

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

            // submit status
            function submit() {
                  let input = document.getElementsByTagName('input');
                  define.sat = parseFloat(input[0].value, 10) || 0.4;
                  define.l_size = parseFloat(input[1].value, 10) || 0.05;
            }

            (document.getElementsByTagName('button')[0]).addEventListener('click', () => submit());
      }
})();
