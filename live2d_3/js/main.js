

class Viewer {
    constructor (basePath) {
        this.l2d = new L2D(basePath);
        window.L2D = this.l2d;
        window.Viewer = this;
        this.canvas = document.querySelector(".Canvas");
      
        // this.selectAnimation = document.querySelector(".selectAnimation");

     

        this.app = new PIXI.Application(1280, 720, { backgroundColor: 0xffffff });
        let width = window.innerWidth;
        let height = (width / 16.0) * 9.0;
        this.app.view.style.width = width + "px";
        this.app.view.style.height = height + "px";
        this.app.renderer.resize(width, height);
        this.canvas.innerHTML = '';
        this.canvas.appendChild(this.app.view);

        this.app.ticker.add((deltaTime) => {
            if (!this.model) {
                return;
            }

            this.model.update(deltaTime);
            this.model.masks.update(this.app.renderer);
        });
        window.onresize = (event) => {
            if (event === void 0) { event = null; }
            let width = window.outerWidth;
            let height = (width / 16.0) * 9.0;
            if(window.outerWidth > 964){
                width = window.outerWidth -289;
            }
            if(window.outerWidth < 500){
                height = (width / 16.0) * 12;
            }
            this.app.view.style.width = width + "px";
            this.app.view.style.height = height + "px";
            this.app.renderer.resize(width, height);

            if (this.model) {
                this.model.position = new PIXI.Point((width * 0.5), (height * 0.5));
                this.model.scale = new PIXI.Point((this.model.position.x * 0.045), (this.model.position.x * 0.045));
                this.model.masks.resize(this.app.view.width, this.app.view.height);
                if(window.innerWidth < 500){
                 
                    this.model.scale = new PIXI.Point((this.model.position.x * 0.075), (this.model.position.x * 0.075));
                }
            }
            
        };
        this.isClick = false;
        
        // PC端鼠标事件
        this.app.view.addEventListener('mousedown', (event) => {
            event.preventDefault();
            this.isClick = true;
        });

        this.app.view.addEventListener('mousemove', (event) => {
            event.preventDefault();
            if (this.isClick) {
                this.isClick = false;
                if (this.model) {
                    this.model.inDrag = true;
                }
            }

            if (this.model) {
                let mouse_x = this.model.position.x - event.clientX;
                let mouse_y = this.model.position.y - event.clientY;
                this.model.pointerX = -mouse_x / this.app.view.height;
                this.model.pointerY = -mouse_y / this.app.view.width;
            }
        });

        this.app.view.addEventListener('mouseup', (event) => {
            event.preventDefault();
            if (!this.model) {
                return;
            }

            if (this.isClick) {
                if (this.isHit('TouchHead', event.clientX, event.clientY)) {
                    this.startAnimation("touch_head", "base");
                } else if (this.isHit('TouchSpecial', event.clientX, event.clientY)) {
                    this.startAnimation("touch_special", "base");
                } else {
                    const bodyMotions = ["touch_body", "main_1", "main_2", "main_3"];
                    let currentMotion = bodyMotions[Math.floor(Math.random()*bodyMotions.length)];
                    this.startAnimation(currentMotion, "base");
                }
            }

            this.isClick = false;
            this.model.inDrag = false;
        });

        // 触摸事件支持
        this.app.view.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.isClick = true;
        });

        this.app.view.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (this.isClick) {
                this.isClick = false;
                if (this.model) {
                    this.model.inDrag = true;
                }
            }

            if (this.model) {
                const touch = event.touches[0];
                let mouse_x = this.model.position.x - touch.clientX;
                let mouse_y = this.model.position.y - touch.clientY;
                this.model.pointerX = -mouse_x / this.app.view.height;
                this.model.pointerY = -mouse_y / this.app.view.width;
            }
        });

        this.app.view.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (!this.model) {
                return;
            }

            if (this.isClick) {
                const touch = event.changedTouches[0];
                if (this.isHit('TouchHead', touch.clientX, touch.clientY)) {
                    this.startAnimation("touch_head", "base");
                } else if (this.isHit('TouchSpecial', touch.clientX, touch.clientY)) {
                    this.startAnimation("touch_special", "base");
                } else {
                    const bodyMotions = ["touch_body", "main_1", "main_2", "main_3"];
                    let currentMotion = bodyMotions[Math.floor(Math.random()*bodyMotions.length)];
                    this.startAnimation(currentMotion, "base");
                }
            }

            this.isClick = false;
            this.model.inDrag = false;
        });
    }

    changeCanvas (model) {
        this.app.stage.removeChildren();

        // 清空动画选择区
        // this.selectAnimation.innerHTML = '';
        // model.motions.forEach((value, key) => {
        //     if (key != "effect") {
        //         let btn = document.createElement("button");
        //         let label = document.createTextNode(key);
        //         btn.appendChild(label);
        //         btn.className = "btn btn-secondary";
        //         btn.addEventListener("click", () => {
        //             this.startAnimation(key, "base");
        //         });
        //         this.selectAnimation.appendChild(btn);
        //     }
        // });

        this.model = model;
        this.model.update = this.onUpdate; // HACK: use hacked update fn for drag support
        this.model.animator.addLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);

        this.app.stage.addChild(this.model);
        this.app.stage.addChild(this.model.masks);

        window.onresize();
    }

    onUpdate (delta) {
        let deltaTime = 0.016 * delta;

        if (!this.animator.isPlaying) {
            let m = this.motions.get("idle");
            this.animator.getLayer("base").play(m);
        }
        this._animator.updateAndEvaluate(deltaTime);

        if (this.inDrag) {
            this.addParameterValueById("ParamAngleX", this.pointerX * 30);
            this.addParameterValueById("ParamAngleY", -this.pointerY * 30);
            this.addParameterValueById("ParamBodyAngleX", this.pointerX * 10);
            this.addParameterValueById("ParamBodyAngleY", -this.pointerY * 10);
            this.addParameterValueById("ParamEyeBallX", this.pointerX);
            this.addParameterValueById("ParamEyeBallY", -this.pointerY);
        }

        if (this._physicsRig) {
            this._physicsRig.updateAndEvaluate(deltaTime);
        }

        this._coreModel.update();

        let sort = false;
        for (let m = 0; m < this._meshes.length; ++m) {
            this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
            this._meshes[m].visible = Live2DCubismCore.Utils.hasIsVisibleBit(this._coreModel.drawables.dynamicFlags[m]);
            if (Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[m];
                this._meshes[m].dirtyVertex = true;
            }
            if (Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                sort = true;
            }
        }

        if (sort) {
            this.children.sort((a, b) => {
                let aIndex = this._meshes.indexOf(a);
                let bIndex = this._meshes.indexOf(b);
                let aRenderOrder = this._coreModel.drawables.renderOrders[aIndex];
                let bRenderOrder = this._coreModel.drawables.renderOrders[bIndex];

                return aRenderOrder - bRenderOrder;
            });
        }

        this._coreModel.drawables.resetDynamicFlags();
    }

    startAnimation (motionId, layerId) {
        if (!this.model) {
            return;
        }

        let m = this.model.motions.get(motionId);
        if (!m) {
            return;
        }

        let l = this.model.animator.getLayer(layerId);
        if (!l) {
            return;
        }

        l.play(m);
    }

    isHit (id, posX, posY) {
        if (!this.model) {
            return false;
        }

        let m = this.model.getModelMeshById(id);
        if (!m) {
            return false;
        }

        const vertexOffset = 0;
        const vertexStep = 2;
        const vertices = m.vertices;

        let left = vertices[0];
        let right = vertices[0];
        let top = vertices[1];
        let bottom = vertices[1];

        for (let i = 1; i < 4; ++i) {
            let x = vertices[vertexOffset + i * vertexStep];
            let y = vertices[vertexOffset + i * vertexStep + 1];

            if (x < left) {
                left = x;
            }
            if (x > right) {
                right = x;
            }
            if (y < top) {
                top = y;
            }
            if (y > bottom) {
                bottom = y;
            }
        }

        let mouse_x = m.worldTransform.tx - posX;
        let mouse_y = m.worldTransform.ty - posY;
        let tx = -mouse_x / m.worldTransform.a;
        let ty = -mouse_y / m.worldTransform.d;

        return ((left <= tx) && (tx <= right) && (top <= ty) && (ty <= bottom));
    }
}

var v = new Viewer('model');