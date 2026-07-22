package engine

import (
	"fmt"
	"time"
)

func generateUUID() string {
	return fmt.Sprintf("%x-%x", time.Now().UnixNano(), time.Now().UnixMilli())
}
