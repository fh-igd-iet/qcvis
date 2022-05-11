// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import {
    AmbientLight,
    Camera,
    CircleGeometry,
    Color,
    EdgesGeometry,
    LineBasicMaterial,
    LineCurve3,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    PointLight,
    Scene,
    TubeGeometry,
    Vector3,
    WebGLRenderer,
} from "three";
import type { QuantumState } from "quantum-circuit";
import { MeshLine, MeshLineMaterial } from "three.meshline";
import {
    CSS2DObject,
    CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { min } from "rambda";
import { getThreeColorForPhase } from "@/components/visualisation/visualisations/common/phase-color";

const CAMERA_Z_OFFSET = 22;

export enum Layer {
    DEFAULT,
    GRID,
    CUBE_INDEX_LABELS,
    CUBE_PROB_LABELS,
}

type LinePos = [Vector3, Vector3];
type PlanePos = [LinePos, LinePos];
type CubePos = [PlanePos, PlanePos];
type TesseractPos = [CubePos, CubePos];

const Definitions: {
    2: LinePos;
    4: PlanePos;
    8: CubePos;
    16: TesseractPos;
} = {
    2: [new Vector3(0, -1.5, 0), new Vector3(0, 1.5, 0)],
    4: [
        [new Vector3(-1.5, -1.5, 0), new Vector3(-1.5, 1.5, 0)],
        [new Vector3(1.5, -1.5, 0), new Vector3(1.5, 1.5, 0)],
    ],
    8: [
        [
            [new Vector3(-1.5, -1.5, -1.5), new Vector3(-1.5, 1.5, -1.5)],
            [new Vector3(1.5, -1.5, -1.5), new Vector3(1.5, 1.5, -1.5)],
        ],
        [
            [new Vector3(-1.5, -1.5, 1.5), new Vector3(-1.5, 1.5, 1.5)],
            [new Vector3(1.5, -1.5, 1.5), new Vector3(1.5, 1.5, 1.5)],
        ],
    ],
    16: [
        [
            [
                [new Vector3(-1.5, -1.5, -1.5), new Vector3(-1.5, 1.5, -1.5)],
                [new Vector3(1.5, -1.5, -1.5), new Vector3(1.5, 1.5, -1.5)],
            ],
            [
                [new Vector3(-1.5, -1.5, 1.5), new Vector3(-1.5, 1.5, 1.5)],
                [new Vector3(1.5, -1.5, 1.5), new Vector3(1.5, 1.5, 1.5)],
            ],
        ],
        [
            [
                [new Vector3(-3, -3, -3), new Vector3(-3, 3, -3)],
                [new Vector3(3, -3, -3), new Vector3(3, 3, -3)],
            ],
            [
                [new Vector3(-3, -3, 3), new Vector3(-3, 3, 3)],
                [new Vector3(3, -3, 3), new Vector3(3, 3, 3)],
            ],
        ],
    ],
};

class StateCubeDefinition {
    private _position: Vector3;
    private _disk: {
        geometry: CircleGeometry;
        material: MeshBasicMaterial;
        mesh: Mesh;
    };
    private _label: CSS2DObject;
    private _probLabel: CSS2DObject;

    constructor(
        scene: Scene,
        camera: Camera,
        position: Vector3,
        state: QuantumState
    ) {
        this._position = position;

        const prob = state.chance / 100.0;

        const radius = 0.5;
        const diskGeometry = new CircleGeometry(radius, 100);
        const diskMaterial = new MeshBasicMaterial({
            color: 0xffffff,
        });
        const disk = new Mesh(diskGeometry, diskMaterial);
        disk.position.copy(position);

        // Force circle to always face camera
        disk.lookAt(camera.position);

        const innerDiskGeometry = new CircleGeometry(radius * prob, 100);
        const innerDiskMaterial = new MeshBasicMaterial({
            color: getThreeColorForPhase(state.phase),
        });
        const innerDisk = new Mesh(innerDiskGeometry, innerDiskMaterial);
        innerDisk.position.z = 0.1;

        disk.add(innerDisk);

        const helperLineMaterial = new LineBasicMaterial({
            color: 0x000000,
        });

        const diskLine = new LineSegments(
            new EdgesGeometry(diskGeometry),
            helperLineMaterial
        );
        disk.add(diskLine);

        scene.add(disk);

        const points = [];
        points.push(0, 0, 0.1);
        points.push(
            radius * Math.cos(state.phase),
            radius * Math.sin(state.phase),
            0.1
        );

        const probabilityVectorMeshLine = new MeshLine();
        probabilityVectorMeshLine.setPoints(points);
        const probabilityVectorMaterial = new MeshLineMaterial({
            lineWidth: 0.03,
            color: 0x000000,
        });
        const probabilityVector = new Mesh(
            probabilityVectorMeshLine,
            probabilityVectorMaterial
        );

        const dg = new CircleGeometry(0.3, 100);
        const dm = new MeshPhongMaterial({
            color: 0xff0000,
        });
        const k = new Mesh(dg, dm);
        k.position.set(1, 1, 1);

        disk.add(probabilityVector);

        this._disk = {
            geometry: diskGeometry,
            material: diskMaterial,
            mesh: disk,
        };

        const cubeLabelDiv = document.createElement("div");
        cubeLabelDiv.className = "state-vector-label";
        cubeLabelDiv.textContent = `|${state.indexBinStr}>`;

        this._label = new CSS2DObject(cubeLabelDiv);
        this._label.position.copy(position);
        this._label.position.y -= 0.75;

        this._label.layers.set(Layer.CUBE_INDEX_LABELS);

        // Set conditional label classes based on z-index in camera coordinates
        this._label.onBeforeRender = (renderer, scene, camera) => {
            const stateVectorLabelCameraPosition = this._label.position.clone();
            stateVectorLabelCameraPosition.applyMatrix4(
                camera.matrixWorldInverse
            );

            const covered =
                stateVectorLabelCameraPosition.z < -CAMERA_Z_OFFSET - 1.4;

            if (covered) {
                cubeLabelDiv.className = "state-vector-label covered";
            } else {
                cubeLabelDiv.className = "state-vector-label";
            }
        };

        scene.add(this._label);

        const cubeProbLabelDiv = document.createElement("div");
        cubeProbLabelDiv.className = "state-vector-label";
        cubeProbLabelDiv.textContent = `${state.chanceStr}%`;

        this._probLabel = new CSS2DObject(cubeProbLabelDiv);
        this._probLabel.position.copy(position);
        this._probLabel.position.y += 0.75;
        this._probLabel.layers.set(Layer.CUBE_PROB_LABELS);
        scene.add(this._probLabel);
    }

    public animate(camera: Camera) {
        // Force circle to always face camera
        this._disk.mesh.lookAt(camera.position);
    }

    public remove(scene: Scene) {
        scene.remove(this._disk.mesh);
        scene.remove(this._label);
        scene.remove(this._probLabel);
        this._disk.material.dispose();
        this._disk.geometry.dispose();
        this._label.remove();
        this._probLabel.remove();
    }
}

export class StateCubeSceneManager {
    public readonly scene: Scene;
    public readonly camera: PerspectiveCamera;
    public readonly renderer: WebGLRenderer;
    public readonly labelRenderer: CSS2DRenderer;

    private _cubes: StateCubeDefinition[] = [];
    private _connectors: Mesh[] = [];

    constructor(container: HTMLElement, defaultLayers = [Layer.DEFAULT]) {
        this.scene = new Scene();
        const background: string = getComputedStyle(
            document.body
        ).getPropertyValue("--cw-background");
        this.scene.background = new Color(
            parseInt(background.substring(background.indexOf("#") + 1), 16)
        );
        this.camera = new PerspectiveCamera(
            35,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 0);
        this.scene.add(this.camera);

        const ambient = new AmbientLight(new Color(255, 255, 255), 0.001);
        this.camera.add(ambient);
        for (const x of [-20, 20]) {
            for (const y of [-20, 20]) {
                const light = new PointLight(new Color(255, 255, 255), 0.0005);
                light.position.set(x, 20, y);
                this.camera.add(light);
            }
        }
        const light0 = new PointLight(new Color(255, 255, 255), 0.002);
        light0.position.set(10, 10, 0);
        this.camera.add(light0);
        const light1 = new PointLight(new Color(255, 255, 255), 0.002);
        light1.position.set(-10, 10, 0);
        this.camera.add(light1);

        this.buildLines(Definitions[16], Definitions[16]);
        this.scene.add(...this._connectors);

        this.renderer = new WebGLRenderer({
            powerPreference: "low-power",
            antialias: true,
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(
            container.clientWidth,
            container.clientHeight
        );
        this.labelRenderer.domElement.style.position = "absolute";
        container.appendChild(this.labelRenderer.domElement);

        const controls = new OrbitControls(
            this.camera,
            this.labelRenderer.domElement
        );
        controls.target.set(0, 0, 0);
        controls.rotateSpeed = 0.25;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = false;

        this.camera.position.z = CAMERA_Z_OFFSET;

        // Override visible layers with defaultLayers selection
        this.camera.layers.disableAll();
        defaultLayers.forEach((layer) => this.camera.layers.enable(layer));

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const ctx = this;

        function animate() {
            requestAnimationFrame(animate);

            if (
                container.clientWidth !== ctx.renderer.domElement.clientWidth ||
                container.clientHeight !== ctx.renderer.domElement.clientHeight
            ) {
                ctx.renderer.setSize(
                    container.clientWidth,
                    container.clientHeight
                );
                ctx.camera.position.z = ctx.getZ(container.clientWidth);
            }
            if (
                container.clientWidth !==
                    ctx.labelRenderer.domElement.clientWidth ||
                container.clientHeight !==
                    ctx.labelRenderer.domElement.clientHeight
            ) {
                ctx.labelRenderer.setSize(
                    container.clientWidth,
                    container.clientHeight
                );
            }
            ctx.camera.aspect = container.clientWidth / container.clientHeight;
            ctx.camera.updateProjectionMatrix();

            controls.update();

            ctx.renderer.render(ctx.scene, ctx.camera);
            ctx.labelRenderer.render(ctx.scene, ctx.camera);

            for (const cube of ctx._cubes) {
                cube.animate(ctx.camera);
            }
        }

        animate();
    }

    public applyStates(state: QuantumState[]) {
        this._cubes.forEach((cube) => cube.remove(this.scene));
        this._cubes = [];
        this._connectors.forEach((connector) => this.scene.remove(connector));
        this._connectors = [];
        const definition = Definitions[min(state.length, 16) as 2 | 4 | 8 | 16];
        this.buildCubes(definition, state);
        this.buildLines(definition, definition);
        this.scene.add(...this._connectors);
    }

    buildCubes(
        pos: Vector3 | LinePos | PlanePos | CubePos | TesseractPos,
        state: QuantumState[]
    ) {
        if (pos instanceof Vector3) {
            this._cubes.push(
                new StateCubeDefinition(
                    this.scene,
                    this.camera,
                    pos,
                    state[this._cubes.length]
                )
            );
        } else {
            for (const p of pos) {
                this.buildCubes(p, state);
            }
        }
    }

    buildLines(
        pos0: Vector3 | LinePos | PlanePos | CubePos | TesseractPos,
        pos1?: Vector3 | LinePos | PlanePos | CubePos | TesseractPos
    ) {
        if (pos0 instanceof Vector3 && pos1 && pos1 instanceof Vector3) {
            const path = new LineCurve3(pos0, pos1);
            const geometryConnector = new TubeGeometry(
                path,
                1,
                0.025,
                4,
                false
            );
            const materialConnector = new MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1,
            });
            const mesh = new Mesh(geometryConnector, materialConnector);
            mesh.layers.set(Layer.GRID);
            this._connectors.push(mesh);
        } else {
            if (!(pos0 instanceof Vector3)) {
                this.buildLines(pos0[0], pos0[1]);
                if (pos1 && !(pos1 instanceof Vector3)) {
                    for (const p of [0, 1]) {
                        this.buildLines(pos0[p], pos1[p]);
                    }
                }
            }
        }
    }

    /**
     * Sets the visibility of a given visual layer.
     * @param layer Layer to set the visibility for.
     * @param visible Target visibility state (true=visible).
     */
    public setLayerVisibility(layer: Layer, visible: boolean) {
        if (visible) {
            this.camera.layers.enable(layer);
        } else {
            this.camera.layers.disable(layer);
        }
    }

    public getZ(width: number): number {
        if (width >= 650) {
            return 22;
        }
        // 650 -> 22
        // 450 -> 30
        // 300 -> 44
        return Math.floor(width * -0.0628571 + 62.85714);
    }

    public remove() {
        this._cubes.forEach((cube) => cube.remove(this.scene));
        this._cubes = [];
        this._connectors.forEach((connector) => this.scene.remove(connector));
        this._connectors = [];
        this.scene.children.forEach((object) => object.remove());
        this.scene.remove();
        this.camera.remove();
        this.renderer.dispose();
    }
}
