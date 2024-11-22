DOCKERCOMPOSE-OA := docker-compose -f docker-compose.yml
OAFRONTEND := oa-frontend
RUN-OAFRONTEND := $(DOCKERCOMPOSE-OA) up -d $(OAFRONTEND)
STOP-OAFRONTEND := $(DOCKERCOMPOSE-OA) stop $(OAFRONTEND) && $(DOCKERCOMPOSE-OA) rm -f $(OAFRONTEND)

.PHONY: run
run:
	$(RUN-OAFRONTEND)

.PHONY: stop
stop:
	$(STOP-OAFRONTEND)


## Help display.
## Pulls comments from beside commands and prints a nicely formatted
## display with the commands and their usage information.
.DEFAULT_GOAL := help

.PHONY: help
help: ## Prints this help
		@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'