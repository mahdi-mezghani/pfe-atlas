from fpdf import FPDF
text = """
AI-Powered Diagnostic Assistant for
Diabetic Retinopathy
PFE Report — Computer Science Department
Authors: Sarah Benali, Karim El Amrani
Supervisor: Prof. Leila Merzoug
Field: Artificial Intelligence / Medical Imaging
Difficulty: Advanced
Keywords Technologies
deep learning, CNN,
retinopathy, diagnosis, OCT
images, classification
Python, TensorFlow, Keras, OpenCV, NumPy, scikit-learn, Flask
Abstract
Diabetic retinopathy is a leading cause of blindness among working-age adults.
Early detection through automated screening can prevent vision loss. This project
proposes a convolutional neural network pipeline that analyzes optical coherence
tomography images to classify retinal conditions into normal, diabetic macular
edema, drusen, and choroidal neovascularization categories. We compare the
performance of VGG16, ResNet50, and a custom lightweight CNN. The best model
achieves 94.7% test accuracy on the OCT2017 dataset. A Flask web interface
allows ophthalmologists to upload scans and receive predictions with attention
heatmaps and confidence scores.

1. Introduction
Diabetic retinopathy (DR) affects more than 93 million people worldwide. The
... (truncated for brevity) ...
"""
# Build a simple 3-page PDF by splitting text
# wrap long lines safely
import textwrap
lines = text.strip().split('\n')
pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()
pdf.set_font("Helvetica", size=12)
for line in lines:
    if not line.strip():
        pdf.ln(4)
        continue
    wrapped = textwrap.wrap(line, width=90)
    for w in wrapped:
        pdf.multi_cell(0, 6, w)
# Save
out = 'uploaded_report.pdf'
pdf.output(out)
print(out)