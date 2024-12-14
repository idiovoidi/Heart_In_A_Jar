import http.server
import socketserver
import webbrowser
import os
import time
import mimetypes

PORT = 8000

class DevHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)

    def do_GET(self):
        # Add timestamp to JavaScript files for cache busting
        if self.path.endswith('.js'):
            self.path = f"{self.path}?v={int(time.time())}"
        
        # Ensure correct MIME types
        if self.path.endswith('.js') or self.path.endswith('.js?v='):
            self.path = self.path.split('?')[0]  # Remove query string for file lookup
            try:
                with open(os.path.join(os.getcwd(), self.path[1:]), 'rb') as f:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/javascript')
                    self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                    self.send_header('Pragma', 'no-cache')
                    self.end_headers()
                    self.wfile.write(f.read())
                return
            except:
                pass

        return super().do_GET()

    def end_headers(self):
        # Disable caching for all responses
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server():
    # Add proper MIME types
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')
    
    # Create server with custom handler
    with socketserver.TCPServer(("", PORT), DevHandler) as httpd:
        print(f"Starting development server at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        
        try:
            # Open browser after a short delay to ensure server is ready
            def open_browser():
                webbrowser.open(f'http://localhost:{PORT}')
            
            from threading import Timer
            Timer(1.0, open_browser).start()
            
            # Start server
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()

if __name__ == '__main__':
    run_server() 