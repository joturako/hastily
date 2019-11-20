import { Sharp } from 'sharp';
import { Mapper, Orientation } from '../mapping-types';
import { FastlyParamError } from '../errors';

type Orienter = (x: Sharp) => Sharp;
const exif: Orienter = sharp => sharp.rotate();
const right: Orienter = sharp => sharp.rotate(270);
const left: Orienter = sharp => sharp.rotate(90);
const flipH: Orienter = sharp => sharp.flop();
const flipV: Orienter = sharp => sharp.flip();
const flipHV: Orienter = sharp => sharp.flop().flip();

const orienters: Record<Orientation, Orienter> = {
  r: right,
  l: left,
  h: flipH,
  v: flipV,
  vh: flipHV,
  hv: flipHV,
  '1': exif,
  '2': flipH,
  '3': flipHV,
  '4': flipV,
  '5': sharp => flipH(right(sharp)),
  '6': right,
  '7': sharp => flipH(left(sharp)),
  '8': left
};

const orient: Mapper = (sharp, params) => {
  const orienter = orienters[params.get('orient') as Orientation];
  if (!orienter) {
    throw new FastlyParamError(
      params,
      'orient',
      `legal values are ${Object.keys(orienters)}`
    );
  }
  return orienter(sharp);
};

export default orient;