package main

import (
	"context"
	"errors"
	"log"
	"net/http"

	driverApi "buf.build/gen/go/ride/driver/bufbuild/connect-go/ride/driver/v1alpha1/driverv1alpha1connect"
	pb "buf.build/gen/go/ride/driver/protocolbuffers/go/ride/driver/v1alpha1"

	"github.com/bufbuild/connect-go"
)

func main() {
	// log.Println("\nlocal")
	// sendRequest("http://localhost:8080")
	log.Println("\nremote")
	sendRequest("https://api-gateway-gbbsdms5pq-de.a.run.app")
	// log.Println("\ndirect")
	// sendRequest("https://driver-service-gbbsdms5pq-em.a.run.app")
}

func sendRequest(url string) {
	// httpclient := &http.Client{
	// 	Transport: &http2.Transport{
	// 		AllowHTTP: true,
	// 		DialTLSContext: func(ctx context.Context, network, addr string, cfg *tls.Config) (net.Conn, error) {
	// 			var d net.Dialer
	// 			return d.DialContext(ctx, network, addr)
	// 		},
	// 	},
	// }
	client := driverApi.NewDriverServiceClient(
		http.DefaultClient,
		url,
		connect.WithGRPC(),
	)
	req := connect.NewRequest(&pb.GetDriverRequest{
		Name: "drivers/test",
	})

	res, err := client.GetDriver(
		context.Background(),
		req,
	)
	if err != nil {
		log.Println(connect.CodeOf(err))
		if connectErr := new(connect.Error); errors.As(err, &connectErr) {
			log.Println(connectErr.Message())
			log.Println(connectErr.Meta())
		}
		return
	}

	log.Println(res.Msg.Driver)
}