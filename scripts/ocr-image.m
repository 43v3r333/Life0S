#import <Foundation/Foundation.h>
#import <Vision/Vision.h>
#import <ImageIO/ImageIO.h>

int main(int argc, const char * argv[]) {
  @autoreleasepool {
    if (argc != 2) { fprintf(stderr, "Image path required\n"); return 2; }
    NSURL *url = [NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]]];
    VNRecognizeTextRequest *request = [VNRecognizeTextRequest new];
    request.recognitionLevel = VNRequestTextRecognitionLevelAccurate;
    request.usesLanguageCorrection = YES;
    // Do not force en-ZA here. Some macOS Vision builds report a nil error and
    // fail the entire request when an unsupported locale is supplied. English
    // recognition and language correction still handle South African banking
    // text correctly without pinning that locale.
    VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithURL:url options:@{}];
    NSError *error = nil; BOOL ok = [handler performRequests:@[request] error:&error];
    if (!ok) { const char *message = error.localizedDescription.UTF8String; fprintf(stderr, "%s\n", message ?: "Apple Vision text recognition failed without an error message"); return 4; }
    NSArray<VNRecognizedTextObservation *> *rows = [request.results sortedArrayUsingComparator:^NSComparisonResult(VNRecognizedTextObservation *a, VNRecognizedTextObservation *b) {
      CGFloat difference = fabs(CGRectGetMidY(a.boundingBox) - CGRectGetMidY(b.boundingBox));
      if (difference > 0.012) return CGRectGetMidY(a.boundingBox) > CGRectGetMidY(b.boundingBox) ? NSOrderedAscending : NSOrderedDescending;
      return CGRectGetMinX(a.boundingBox) < CGRectGetMinX(b.boundingBox) ? NSOrderedAscending : NSOrderedDescending;
    }];
    for (VNRecognizedTextObservation *observation in rows) { VNRecognizedText *text = [[observation topCandidates:1] firstObject]; if (text.string.length) printf("%s\n", text.string.UTF8String); }
  }
  return 0;
}
