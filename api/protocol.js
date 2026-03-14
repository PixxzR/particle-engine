/**
 * WebSocket Protocol Definition
 * All messages between CLI/AI and the renderer go through this protocol.
 */

export const MessageTypes = {
  FORMATION: 'formation',
  COLOR: 'color',
  EFFECT: 'effect',
  CAMERA: 'camera',
  CONFIG: 'config',
  CUSTOM: 'custom',
  SNAPSHOT: 'snapshot',
  RESET: 'reset',
  STATE: 'state',
  SEQUENCE: 'sequence',
  ACK: 'ack',
  ERROR: 'error',
};

export const Formations = [
  'sphere', 'cube', 'helix', 'torus', 'wave', 'galaxy',
  'tornado', 'grid', 'explosion', 'heart', 'random', 'image',
];

export const ColorSchemes = [
  'rainbow', 'fire', 'ice', 'ocean', 'neon', 'monochrome',
  'sunset', 'matrix', 'custom',
];

export const Effects = [
  'bloom', 'pulse', 'trails', 'explosion', 'implosion',
];

export function validate(msg) {
  if (!msg || !msg.type) return { valid: false, error: 'Missing message type' };

  switch (msg.type) {
    case MessageTypes.FORMATION:
      if (!msg.name) return { valid: false, error: 'Missing formation name' };
      if (!Formations.includes(msg.name) && msg.name !== 'custom')
        return { valid: false, error: `Unknown formation: ${msg.name}. Available: ${Formations.join(', ')}` };
      return { valid: true };

    case MessageTypes.COLOR:
      if (!msg.scheme) return { valid: false, error: 'Missing color scheme' };
      if (!ColorSchemes.includes(msg.scheme))
        return { valid: false, error: `Unknown scheme: ${msg.scheme}. Available: ${ColorSchemes.join(', ')}` };
      return { valid: true };

    case MessageTypes.EFFECT:
      if (!msg.name) return { valid: false, error: 'Missing effect name' };
      if (!Effects.includes(msg.name))
        return { valid: false, error: `Unknown effect: ${msg.name}. Available: ${Effects.join(', ')}` };
      return { valid: true };

    case MessageTypes.CAMERA:
      if (!msg.action) return { valid: false, error: 'Missing camera action' };
      if (!['orbit', 'zoom', 'position', 'lookAt', 'reset'].includes(msg.action))
        return { valid: false, error: 'Unknown camera action' };
      return { valid: true };

    case MessageTypes.CONFIG:
      return { valid: true };

    case MessageTypes.CUSTOM:
      if (!msg.code) return { valid: false, error: 'Missing custom code' };
      return { valid: true };

    case MessageTypes.SEQUENCE:
      if (!Array.isArray(msg.steps)) return { valid: false, error: 'Sequence needs steps array' };
      return { valid: true };

    case MessageTypes.SNAPSHOT:
    case MessageTypes.RESET:
    case MessageTypes.STATE:
      return { valid: true };

    default:
      return { valid: false, error: `Unknown message type: ${msg.type}` };
  }
}
