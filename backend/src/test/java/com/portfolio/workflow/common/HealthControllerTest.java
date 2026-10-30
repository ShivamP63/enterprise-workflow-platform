package com.portfolio.workflow.common;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
class HealthControllerTest {@Test void healthReturnsOk(){assertEquals("ok",new HealthController().health().get("status"));}}
