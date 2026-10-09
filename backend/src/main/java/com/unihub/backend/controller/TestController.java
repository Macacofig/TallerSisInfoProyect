package com.unihub.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.unihub.backend.common.Constants.Test.BASE;

@RestController
public class TestController {

    @GetMapping(BASE)
    public String test() {
        return "UniHub funcionando";
    }
}