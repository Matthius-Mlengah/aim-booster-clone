export type Attempt = {
  t: number;
  hit: boolean;
  rt?: number;
  dx?: number;
  dy?: number;
  dist?: number;    
  quality?: number;  
};

export type Target = { id: number; x: number; y: number; born: number; life: number };

export type HudStats = {
  elapsedMs: number;
  fps: number;
  accuracy: number; 
  targets: number;  
  burst: number;   
  spawnEvery: number;
};
