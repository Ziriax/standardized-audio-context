import { loadFixtureAsArrayBuffer } from '../../../helper/load-fixture';
import { spy } from 'sinon';

describe('audioContextConstructor', () => {
    let audioContext;

    afterEach(() => audioContext.close());

    describe('without a constructed AudioContext', () => {
        // bug #51

        it('should allow to set the latencyHint to an unsupported value', () => {
            audioContext = new AudioContext({ latencyHint: 'negative' });
        });
    });

    describe('with a constructed AudioContext', () => {
        beforeEach(() => {
            audioContext = new AudioContext();
        });

        describe('destination', () => {
            describe('numberOfOutputs', () => {
                // bug #168

                it('should be zero', () => {
                    expect(audioContext.destination.numberOfOutputs).to.equal(0);
                });
            });
        });

        describe('listener', () => {
            // bug #117

            it('should not be implemented', () => {
                expect(audioContext.listener.forwardX).to.be.undefined;
                expect(audioContext.listener.forwardY).to.be.undefined;
                expect(audioContext.listener.forwardZ).to.be.undefined;
                expect(audioContext.listener.positionX).to.be.undefined;
                expect(audioContext.listener.positionY).to.be.undefined;
                expect(audioContext.listener.positionZ).to.be.undefined;
                expect(audioContext.listener.upX).to.be.undefined;
                expect(audioContext.listener.upY).to.be.undefined;
                expect(audioContext.listener.upZ).to.be.undefined;
            });
        });

        describe('createAnalyser()', () => {
            // bug #37

            it('should have a channelCount of 1', () => {
                const analyserNode = audioContext.createAnalyser();

                expect(analyserNode.channelCount).to.equal(1);
            });
        });

        describe('createBiquadFilter()', () => {
            let biquadFilterNode;

            beforeEach(() => {
                biquadFilterNode = audioContext.createBiquadFilter();
            });

            describe('detune', () => {
                describe('automationRate', () => {
                    // bug #84

                    it('should not be implemented', () => {
                        expect(biquadFilterNode.detune.automationRate).to.be.undefined;
                    });
                });
            });

            describe('detune', () => {
                describe('maxValue', () => {
                    // bug #78

                    it('should be the largest possible positive float value', () => {
                        expect(biquadFilterNode.detune.maxValue).to.equal(3.4028234663852886e38);
                    });
                });

                describe('minValue', () => {
                    // bug #78

                    it('should be the smallest possible negative float value', () => {
                        expect(biquadFilterNode.detune.minValue).to.equal(-3.4028234663852886e38);
                    });
                });
            });

            describe('frequency', () => {
                describe('minValue', () => {
                    // bug #77

                    it('should be the negative nyquist frequency', () => {
                        expect(biquadFilterNode.frequency.minValue).to.equal(-(audioContext.sampleRate / 2));
                    });
                });
            });

            describe('gain', () => {
                describe('maxValue', () => {
                    // bug #79

                    it('should be the largest possible positive float value', () => {
                        expect(biquadFilterNode.gain.maxValue).to.equal(3.4028234663852886e38);
                    });
                });
            });
        });

        describe('createBuffer()', () => {
            // bug #157

            describe('copyFromChannel()/copyToChannel()', () => {
                let audioBuffer;

                beforeEach(() => {
                    audioBuffer = audioContext.createBuffer(2, 100, 44100);
                });

                it('should not allow to copy values with a bufferOffset greater than the length of the AudioBuffer', () => {
                    const source = new Float32Array(10);

                    expect(() => audioBuffer.copyToChannel(source, 0, 101)).to.throw(Error);
                });
            });
        });

        describe('createIIRFilter()', () => {
            let iIRFilterNode;

            beforeEach(() => {
                iIRFilterNode = audioContext.createIIRFilter([1], [1]);
            });

            describe('getFrequencyResponse()', () => {
                // bug #23

                it('should not throw an InvalidAccessError', () => {
                    iIRFilterNode.getFrequencyResponse(new Float32Array([1]), new Float32Array(0), new Float32Array(1));
                });

                // bug #24

                it('should not throw an InvalidAccessError', () => {
                    iIRFilterNode.getFrequencyResponse(new Float32Array([1]), new Float32Array(1), new Float32Array(0));
                });
            });
        });

        describe('createGain()', () => {
            describe('gain', () => {
                let gainNode;

                beforeEach(() => {
                    gainNode = audioContext.createGain();
                });

                describe('cancelAndHoldAtTime()', () => {
                    // bug #28

                    it('should not be implemented', () => {
                        expect(gainNode.gain.cancelAndHoldAtTime).to.be.undefined;
                    });
                });

                describe('setValueCurveAtTime()', () => {
                    // bug #25

                    it('should not allow to use setValueCurveAtTime after calling cancelScheduledValues', () => {
                        gainNode.gain.setValueCurveAtTime([1, 1], 0, 1);
                        gainNode.gain.cancelScheduledValues(0.2);
                        expect(() => {
                            gainNode.gain.setValueCurveAtTime([1, 1], 0.4, 1);
                        }).to.throw(Error);
                    });
                });
            });
        });

        describe('createOscillator()', () => {
            let oscillatorNode;

            beforeEach(() => {
                oscillatorNode = audioContext.createOscillator();
            });

            describe('detune', () => {
                describe('maxValue', () => {
                    // bug #81

                    it('should be the largest possible positive float value', () => {
                        expect(oscillatorNode.detune.maxValue).to.equal(3.4028234663852886e38);
                    });
                });

                describe('minValue', () => {
                    // bug #81

                    it('should be the smallest possible negative float value', () => {
                        expect(oscillatorNode.detune.minValue).to.equal(-3.4028234663852886e38);
                    });
                });
            });
        });

        describe('decodeAudioData()', () => {
            // bug #6

            it('should not call the errorCallback at all', (done) => {
                const errorCallback = spy();

                audioContext.decodeAudioData(null, () => {}, errorCallback);

                setTimeout(() => {
                    expect(errorCallback).to.have.not.been.called;

                    done();
                }, 1000);
            });

            // bug #43

            it('should not throw a DataCloneError', function (done) {
                this.timeout(10000);

                loadFixtureAsArrayBuffer('1000-frames-of-noise-stereo.wav').then((arrayBuffer) => {
                    audioContext
                        .decodeAudioData(arrayBuffer)
                        .then(() => audioContext.decodeAudioData(arrayBuffer))
                        .catch((err) => {
                            expect(err.code).to.not.equal(25);
                            expect(err.name).to.not.equal('DataCloneError');

                            done();
                        });
                });
            });
        });
    });
});
