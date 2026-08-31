// utils/dmTopic.ts — Nome canônico do tópico de uma conversa direta (DM)
//
// O realtime (Phoenix) autoriza entrar na sala "room:dm:<par>" apenas para
// os dois participantes, identificados pelos IDs de usuário. O nome do tópico
// é determinístico: ordenamos os dois IDs (lexicograficamente, como string) e
// unimos por "_". Assim, não importa a ordem dos argumentos, os dois lados da
// conversa sempre calculam o MESMO tópico — o que bate com a regra do backend
// (realtime/lib/jcl_chat_web/room_channel.ex).

export function getDmTopic(userIdA: string, userIdB: string): string {
  const [low, high] = [userIdA, userIdB].sort();
  return `room:dm:${low}_${high}`;
}
