package com.unihub.backend.common;

import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;

public class DiaDeserializer extends ValueDeserializer<Integer> {

    @Override
    public Integer deserialize(JsonParser parser, DeserializationContext context) {
        String valor = parser.getValueAsString();
        Integer dia = DiaSemana.numero(valor);
        return dia == null ? 0 : dia;
    }
}