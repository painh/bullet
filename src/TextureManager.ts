import { Assets, Texture } from 'pixi.js';

export class TextureManager {
  private textures: Map<string, Texture> = new Map();
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    const textureNames = [
      'ShHit',
      'DpMyShip', 'DpEnemy', 'DpRedBullet', 'DpBlueBullet',
      'PsMyShip', 'PsEnemy', 'PsNeedle', 'PsBullet',
      'IkBlackMyShip', 'IkWhiteMyShip', 'IkEnemy', 'IkBlackBullet', 'IkWhiteBullet',
      'ThMyShip', 'ThEnemy', 'ThBlackBullet', 'ThWhiteBullet',
    ];

    const loadPromises: Promise<void>[] = [];

    for (const name of textureNames) {
      // M = 흑백 모드, C = 컬러 모드
      for (const suffix of ['M', 'C']) {
        const key = `${name}${suffix}`;
        // Vite의 base URL을 사용하여 GitHub Pages에서도 올바른 경로로 로드
        const path = `${import.meta.env.BASE_URL}textures/${key}.png`;
        loadPromises.push(
          Assets.load(path).then((texture: Texture) => {
            this.textures.set(key, texture);
          }).catch(() => {
            console.warn(`Failed to load texture: ${path}`);
          })
        );
      }
    }

    await Promise.all(loadPromises);
    this.loaded = true;
  }

  get(name: string, colorMode: boolean): Texture | undefined {
    const suffix = colorMode ? 'C' : 'M';
    return this.textures.get(`${name}${suffix}`);
  }

  getByKey(key: string): Texture | undefined {
    return this.textures.get(key);
  }
}

export const textureManager = new TextureManager();
