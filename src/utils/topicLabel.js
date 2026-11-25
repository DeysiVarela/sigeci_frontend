// Las líneas temáticas vienen de la BD en español (topic.topic_subject).
// Se traducen con global.json -> "topicNames", buscando por el nombre en español.
// Si no hay traducción (línea nueva o renombrada), se muestra el nombre original.
export const translateTopic = (t, name) =>
    name ? t(`topicNames.${name}`, { defaultValue: name }) : name;