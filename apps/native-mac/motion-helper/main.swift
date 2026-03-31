import Foundation
import AVFoundation

class KnockDetector: NSObject, AVAudioRecorderDelegate {
    private var audioEngine: AVAudioEngine?
    private var threshold: Float = 0.15
    private var lastKnockTime: Date = Date.distantPast
    private var cooldown: TimeInterval = 0.3
    private var tapInstalled = false

    func setThreshold(_ value: Float) {
        self.threshold = value
    }

    func start() {
        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let format = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 4096, format: format) { [weak self] buffer, time in
            self?.processBuffer(buffer)
        }

        do {
            try engine.start()
            audioEngine = engine
            print("KnockDetector: Started listening for knocks with threshold \(threshold)")
        } catch {
            print("Audio engine error: \(error)")
        }
    }

    func stop() {
        audioEngine?.stop()
        audioEngine = nil
        print("KnockDetector: Stopped")
    }

    private func processBuffer(_ buffer: AVAudioPCMBuffer) {
        guard let channelData = buffer.floatChannelData else { return }
        let channelCount = Int(buffer.format.channelCount)
        let frameLength = Int(buffer.frameLength)

        var sum: Float = 0
        for channel in 0..<channelCount {
            let samples = channelData[channel]
            for i in 0..<frameLength {
                sum += abs(samples[i])
            }
        }

        let avgAmplitude = sum / (Float(frameLength) * Float(channelCount))

        if avgAmplitude > threshold {
            let now = Date()
            if now.timeIntervalSince(lastKnockTime) > cooldown {
                lastKnockTime = now
                let intensity = min(avgAmplitude * 100, 100)
                let json = "{\"type\":\"knock\",\"intensity\":\(String(format: "%.1f", intensity))}"
                print(json)
                fflush(stdout)
            }
        }
    }
}

let detector = KnockDetector()

func readCommands() {
    while let line = readLine(strippingNewline: true) {
        if let data = line.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            switch json["type"] as? String {
            case "set_threshold":
                if let value = json["value"] as? Float {
                    detector.setThreshold(value)
                    print("{\"type\":\"threshold_set\",\"value\":\(value)}")
                    fflush(stdout)
                }
            case "stop":
                detector.stop()
                exit(0)
            default:
                break
            }
        }
    }
}

detector.start()
readCommands()
