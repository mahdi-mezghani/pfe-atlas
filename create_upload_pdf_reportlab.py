from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import textwrap

content = """
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

out = 'uploaded_report.pdf'
width, height = A4
c = canvas.Canvas(out, pagesize=A4)
left_margin = 40
right_margin = 40
top_margin = 40
bottom_margin = 40
max_width = width - left_margin - right_margin
lines = content.strip().split('\n')
textobject = c.beginText()
textobject.setTextOrigin(left_margin, height - top_margin)
textobject.setFont('Helvetica', 10)
for line in lines:
    if not line.strip():
        textobject.textLine('')
        continue
    wrapped = textwrap.wrap(line, width=90)
    for w in wrapped:
        textobject.textLine(w)
        if textobject.getY() < bottom_margin:
            c.drawText(textobject)
            c.showPage()
            textobject = c.beginText()
            textobject.setTextOrigin(left_margin, height - top_margin)
            textobject.setFont('Helvetica', 10)
c.drawText(textobject)
c.save()
print(out)