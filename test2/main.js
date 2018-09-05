(() => {
      window.onload = init;

      function init() {
            let time = 0.0,
                stop = false,
                temp_time = 0.0,
                uniLocation = [];

            (ctrl = document.getElementById('controller')).addEventListener('click', () => {
                  ctrl.innerText = stop ? 'STOP' : 'PLAY';
                  stop = !stop;

                  if (stop) {

                  }
            });

            let canv = document.getElementById('webgl-canvas'),
                cw = 512,
                ch = 512;

      	canv.width = cw;
            canv.height = ch;
      	canv.addEventListener('mousemove', mouse_move, true);
      	ctx_gl = canv.getContext('webgl') || canv.getContext('experimental-webgl');

      	let prg = create_program(create_shader('vs'), create_shader('fs'));
      	uniLocation[0] = ctx_gl.getUniformLocation(prg, 'time');
      	uniLocation[1] = ctx_gl.getUniformLocation(prg, 'mouse');
      	uniLocation[2] = ctx_gl.getUniformLocation(prg, 'res');

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

      	let vPosition = create_vbo(position),
      	    vIndex = create_ibo(index),
      	    vAttLocation = ctx_gl.getAttribLocation(prg, 'position');

      	ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, vPosition);
      	ctx_gl.enableVertexAttribArray(vAttLocation);
      	ctx_gl.vertexAttribPointer(vAttLocation, 3, ctx_gl.FLOAT, false, 0, 0);
      	ctx_gl.bindBuffer(ctx_gl.ELEMENT_ARRAY_BUFFER, vIndex);

      	ctx_gl.clearColor(0.0, 0.0, 0.0, 1.0);
      	mx = 0.5;
            my = 0.5;

      	start_time = new Date().getTime();
            tick_count = 0;
      	tick();

            function tick() {
                  if (!stop) {
                        tick_count ++;
                        time = ((start_time + tick_count) - start_time) * 0.02;

                  	ctx_gl.clear(ctx_gl.COLOR_BUFFER_BIT);

                        // glsl shader内部の変数に値を引き渡す処理
                  	ctx_gl.uniform1f(uniLocation[0], time + temp_time);
                  	ctx_gl.uniform2fv(uniLocation[1], [mx, my]);
                  	ctx_gl.uniform2fv(uniLocation[2], [cw, ch]);

                        // 画面を更新する処理
                  	ctx_gl.drawElements(ctx_gl.TRIANGLES, 6, ctx_gl.UNSIGNED_SHORT, 0);
                  	ctx_gl.flush();
                  }

                  requestAnimationFrame(tick);
            }

            function mouse_move(e) {
                  mx = e.offsetX / cw;
                  my = e.offsetY / ch;
            }

            function create_shader(id) {
            	let shader;

            	let scriptElement = document.getElementById(id);
            	if (!scriptElement) return;

            	switch(scriptElement.type){
            		case 'x-shader/x-vertex':
            			shader = ctx_gl.createShader(ctx_gl.VERTEX_SHADER);
            			break;

            		case 'x-shader/x-fragment':
            			shader = ctx_gl.createShader(ctx_gl.FRAGMENT_SHADER);
            			break;
            	}

            	ctx_gl.shaderSource(shader, scriptElement.text);
            	ctx_gl.compileShader(shader);

            	if (ctx_gl.getShaderParameter(shader, ctx_gl.COMPILE_STATUS)) {
            		return shader;
            	} else {
            		alert(ctx_gl.getShaderInfoLog(shader));
            		console.log(ctx_gl.getShaderInfoLog(shader));
            	}
            }

            function create_program(vs, fs) {
            	let program = ctx_gl.createProgram();

            	ctx_gl.attachShader(program, vs);
            	ctx_gl.attachShader(program, fs);
            	ctx_gl.linkProgram(program);

            	if (ctx_gl.getProgramParameter(program, ctx_gl.LINK_STATUS)) {
            		ctx_gl.useProgram(program);
            		return program;
            	} else {
            		return null;
            	}
            }

            function create_vbo(data) {
            	let vbo = ctx_gl.createBuffer();
            	ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, vbo);
            	ctx_gl.bufferData(ctx_gl.ARRAY_BUFFER, new Float32Array(data), ctx_gl.STATIC_DRAW);
            	ctx_gl.bindBuffer(ctx_gl.ARRAY_BUFFER, null);

            	return vbo;
            }

            function create_ibo(data) {
            	let ibo = ctx_gl.createBuffer();
            	ctx_gl.bindBuffer(ctx_gl.ELEMENT_ARRAY_BUFFER, ibo);
            	ctx_gl.bufferData(ctx_gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), ctx_gl.STATIC_DRAW);
            	ctx_gl.bindBuffer(ctx_gl.ELEMENT_ARRAY_BUFFER, null);

            	return ibo;
            }
      }
})();
